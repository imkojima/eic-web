import type { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { useRouter } from 'next/router'
import type { ReactElement } from 'react'
import { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'

import NewsletterOptions from '~/components/auth/newsletter-options'
import ValidationIndicator from '~/components/auth/validation-indicator'
import LayoutGeneral from '~/components/layout/layout-general'
import { LOCATION_OPTIONS, VALIDATION_RULES } from '~/constants/auth'
import { getProviderDisplayName } from '~/constants/auth'
import { useAuth } from '~/hooks/useAuth'
import { getSignInMethodsForEmail } from '~/lib/firebase/auth'
import {
  type NotificationSection,
  createMember,
  getAllSections,
  updateMemberSubscriptions,
} from '~/lib/graphql/member'
import type { NextPageWithLayout } from '~/pages/_app'
import type {
  RegisterFormData,
  RegisterFormErrors,
  RegisterFormValidation,
} from '~/types/auth'
import { setPrivateCacheControl } from '~/utils/common'
import { fetchHeaderData } from '~/utils/header-data'

const PageWrapper = styled.div`
  background-color: #ffffff;
  min-height: 100vh;
`

const ContentWrapper = styled.div`
  max-width: 400px;
  margin: 0 auto;
  padding: 40px 20px 60px;

  ${({ theme }) => theme.breakpoint.md} {
    padding: 60px 20px 80px;
  }
`

const Title = styled.h1`
  font-size: 20px;
  font-weight: 700;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.primary[20]};
  text-align: center;
  margin: 0 0 32px;

  ${({ theme }) => theme.breakpoint.md} {
    font-size: 24px;
    margin-bottom: 40px;
  }
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const Input = styled.input`
  width: 100%;
  padding: 10px 14px;
  font-size: 16px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.grayscale[0]};
  background-color: white;
  border: 1px solid ${({ theme }) => theme.colors.grayscale[60]};
  border-radius: 4px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary[20]};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.grayscale[60]};
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.grayscale[95]};
    cursor: not-allowed;
  }
`

const PasswordWrapper = styled.div`
  position: relative;
`

const PasswordInput = styled(Input)`
  padding-right: 48px;
`

const ToggleButton = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.grayscale[60]};

  &:hover {
    color: ${({ theme }) => theme.colors.grayscale[40]};
  }
`

const Select = styled.select`
  width: 100%;
  padding: 10px 32px 10px 14px;
  font-size: 16px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.grayscale[0]};
  background-color: white;
  border: 1px solid ${({ theme }) => theme.colors.grayscale[60]};
  border-radius: 4px;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236F6F72' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 16px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary[20]};
  }
`

const CheckboxGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px 24px;
`

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.grayscale[0]};
  cursor: pointer;
`

const HiddenCheckbox = styled.input`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
`

const CheckboxIcon = styled.span<{ $checked: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid
    ${({ theme, $checked }) =>
      $checked ? theme.colors.primary[40] : theme.colors.grayscale[80]};
  background-color: ${({ theme, $checked }) =>
    $checked ? theme.colors.primary[40] : 'transparent'};
  transition: all 0.2s ease;
  flex-shrink: 0;

  &::after {
    content: '';
    display: ${({ $checked }) => ($checked ? 'block' : 'none')};
    width: 6px;
    height: 10px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
    margin-top: -2px;
  }
`

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
`

const PrimaryButton = styled.button`
  width: 100%;
  padding: 12px 20px;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.5;
  color: white;
  background-color: ${({ theme }) => theme.colors.primary[20]};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary[0]};
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.grayscale[60]};
    cursor: not-allowed;
  }
`

const SecondaryButton = styled.button`
  width: 100%;
  padding: 12px 20px;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.grayscale[40]};
  background-color: white;
  border: 1px solid rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.grayscale[99]};
    color: ${({ theme }) => theme.colors.grayscale[0]};
  }
`

const ErrorMessage = styled.div`
  font-size: 14px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.error.d};
`

const SectionLabel = styled.div`
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.primary[20]};
  margin-bottom: 8px;
  text-align: center;
`

const SectionHint = styled.p`
  font-size: 12px;
  font-weight: 400;
  line-height: 1.25;
  color: ${({ theme }) => theme.colors.grayscale[0]};
  margin: 0 0 8px;
  text-align: center;
`

// Eye icon for showing password
const EyeIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path d="M10 4C4.5 4 1 10 1 10s3.5 6 9 6 9-6 9-6-3.5-6-9-6z" />
    <circle cx="10" cy="10" r="3" />
  </svg>
)

// Eye-off icon for hiding password
const EyeOffIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path d="M10 4C4.5 4 1 10 1 10s3.5 6 9 6 9-6 9-6-3.5-6-9-6z" />
    <circle cx="10" cy="10" r="3" />
    <path d="M3 17L17 3" />
  </svg>
)

type PageProps = InferGetServerSidePropsType<typeof getServerSideProps>

const RegisterPage: NextPageWithLayout<PageProps> = ({ sections }) => {
  const router = useRouter()
  const { email: queryEmail, provider } = router.query
  const {
    firebaseUser,
    member,
    loading: authLoading,
    signUpWithEmail,
    error,
    clearError,
    refreshMember,
  } = useAuth()

  // Redirect if user is already logged in and has a member record
  useEffect(() => {
    if (!authLoading && firebaseUser && member && !provider) {
      // User is already fully registered, redirect to home
      router.replace('/')
    }
  }, [authLoading, firebaseUser, member, provider, router])

  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: (queryEmail as string) || '',
    password: '',
    confirmPassword: '',
    location: '',
    customLocation: '',
    birthDate: '',
    interestedSectionIds: [],
    dailyNewsletter: false,
    weeklyNewsletter: false,
    newsletterFormat: 'standard',
  })

  const [validation, setValidation] = useState<RegisterFormValidation>({
    email: null,
    password: null,
    confirmPassword: null,
  })

  const [errors, setErrors] = useState<RegisterFormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  // If user came from social login, prefill email and validate
  useEffect(() => {
    if (firebaseUser && provider) {
      const email = firebaseUser.email || ''
      setFormData((prev) => ({
        ...prev,
        email,
        name: firebaseUser.displayName || '',
      }))
      // Validate prefilled email
      if (email) {
        setValidation((prev) => ({
          ...prev,
          email: VALIDATION_RULES.email.pattern.test(email),
        }))
      }
    }
  }, [firebaseUser, provider])

  // Validate email from URL query parameter on initial load
  useEffect(() => {
    if (queryEmail && typeof queryEmail === 'string') {
      setFormData((prev) => ({
        ...prev,
        email: queryEmail,
      }))
      setValidation((prev) => ({
        ...prev,
        email: VALIDATION_RULES.email.pattern.test(queryEmail),
      }))
    }
  }, [queryEmail])

  // Validate email format
  const validateEmail = useCallback((email: string): boolean => {
    return VALIDATION_RULES.email.pattern.test(email)
  }, [])

  // Validate password length
  const validatePassword = useCallback((password: string): boolean => {
    return password.length >= VALIDATION_RULES.password.minLength
  }, [])

  // Validate confirm password
  const validateConfirmPassword = useCallback(
    (password: string, confirmPassword: string): boolean => {
      return password === confirmPassword && confirmPassword.length > 0
    },
    []
  )

  // Handle input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user starts typing
    if (errors[name as keyof RegisterFormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }

    // Real-time validation
    if (name === 'email') {
      setValidation((prev) => ({
        ...prev,
        email: value ? validateEmail(value) : null,
      }))
    } else if (name === 'password') {
      setValidation((prev) => ({
        ...prev,
        password: value ? validatePassword(value) : null,
        confirmPassword: formData.confirmPassword
          ? validateConfirmPassword(value, formData.confirmPassword)
          : null,
      }))
    } else if (name === 'confirmPassword') {
      setValidation((prev) => ({
        ...prev,
        confirmPassword: value
          ? validateConfirmPassword(formData.password, value)
          : null,
      }))
    }
  }

  // Handle section selection
  const handleSectionToggle = (sectionId: string) => {
    setFormData((prev) => ({
      ...prev,
      interestedSectionIds: prev.interestedSectionIds.includes(sectionId)
        ? prev.interestedSectionIds.filter((id) => id !== sectionId)
        : [...prev.interestedSectionIds, sectionId],
    }))
  }

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: RegisterFormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = '請填寫姓名'
    }

    if (!formData.email.trim()) {
      newErrors.email = '請填寫 Email'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email 格式不正確'
    }

    // Only validate password for email signup (not social login)
    if (!provider) {
      if (!formData.password) {
        newErrors.password = '請填寫密碼'
      } else if (!validatePassword(formData.password)) {
        newErrors.password = `密碼需至少 ${VALIDATION_RULES.password.minLength} 位數`
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = '請確認密碼'
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = '密碼輸入不一致，請確認'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Helper to create member from form data
  const createMemberFromForm = async (uid: string) => {
    // Parse name into firstName and lastName (Chinese style: lastName first)
    const nameParts = formData.name.trim().split(/\s+/)
    const lastName = nameParts[0] || ''
    const firstName = nameParts.slice(1).join(' ') || ''

    // Convert date to ISO 8601 format (DateTime scalar requires full ISO string)
    const birthDateISO = formData.birthDate
      ? new Date(formData.birthDate).toISOString()
      : undefined

    // Use customLocation if "其他" is selected, otherwise use location
    const city =
      formData.location === '其他'
        ? formData.customLocation || undefined
        : formData.location || undefined

    // Connect interested sections if any selected
    const interestedSections =
      formData.interestedSectionIds.length > 0
        ? { connect: formData.interestedSectionIds.map((id) => ({ id })) }
        : undefined

    // Create member first (without newsletter - that's handled separately)
    const member = await createMember({
      firebaseId: uid,
      email: formData.email,
      firstName,
      lastName,
      city,
      birthDate: birthDateISO,
      interestedSections,
    })

    // Set up newsletter subscriptions if any are selected
    const hasDaily = formData.dailyNewsletter
    const hasWeekly = formData.weeklyNewsletter

    if (hasDaily || hasWeekly) {
      await updateMemberSubscriptions(
        member.id,
        uid,
        {
          daily: hasDaily ? formData.newsletterFormat : null,
          weekly: hasWeekly ? formData.newsletterFormat : null,
        },
        {
          syncToMailchimp: true,
          email: formData.email,
        }
      )
    }

    return member
  }

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    clearError()

    try {
      // If social login, user is already authenticated
      if (provider && firebaseUser) {
        await createMemberFromForm(firebaseUser.uid)
        await refreshMember()
        router.push('/auth/register-result?success=true')
      } else {
        // Email signup - signUpWithEmail now returns the User object directly
        const user = await signUpWithEmail(formData.email, formData.password)
        if (user) {
          await createMemberFromForm(user.uid)
          await refreshMember()
          router.push('/auth/register-result?success=true')
        } else {
          // signUpWithEmail failed, error is set in auth context
          const errorMsg = encodeURIComponent(error || '註冊失敗')
          router.push(`/auth/register-result?success=false&error=${errorMsg}`)
        }
      }
    } catch (err) {
      let friendlyMessage = '註冊時發生錯誤'

      // Detect Prisma unique constraint error on email (email already exists in CMS)
      const errMessage = err instanceof Error ? err.message : ''
      if (
        errMessage.includes('Unique constraint') &&
        errMessage.includes('email')
      ) {
        try {
          const methods = await getSignInMethodsForEmail(formData.email)
          if (methods.length > 0) {
            const providerName = getProviderDisplayName(methods[0])
            friendlyMessage = `此 email 已經註冊過，請選擇以 ${providerName} 帳號登入`
          } else {
            friendlyMessage = '此 email 已經註冊過，請使用原登入方式登入'
          }
        } catch {
          friendlyMessage = '此 email 已經註冊過，請使用原登入方式登入'
        }
      } else if (errMessage) {
        friendlyMessage = errMessage
      }

      const errorMsg = encodeURIComponent(friendlyMessage)
      router.push(`/auth/register-result?success=false&error=${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    router.push('/auth/login')
  }

  return (
    <PageWrapper>
      <ContentWrapper>
        <Title>註冊成為會員</Title>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="姓名 *"
              value={formData.name}
              onChange={handleInputChange}
              disabled={loading}
            />
            {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Email *"
              value={formData.email}
              onChange={handleInputChange}
              disabled={loading || (!!provider && !!firebaseUser?.email)}
            />
            <ValidationIndicator
              isValid={validation.email}
              message={VALIDATION_RULES.email.message}
              errorMessage={VALIDATION_RULES.email.errorMessage}
            />
            {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
          </FormGroup>

          {!provider && (
            <>
              <FormGroup>
                <PasswordWrapper>
                  <PasswordInput
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="密碼 *"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                  <ToggleButton
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? '隱藏密碼' : '顯示密碼'}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </ToggleButton>
                </PasswordWrapper>
                <ValidationIndicator
                  isValid={validation.password}
                  message={VALIDATION_RULES.password.message}
                  errorMessage={VALIDATION_RULES.password.errorMessage}
                />
                {errors.password && (
                  <ErrorMessage>{errors.password}</ErrorMessage>
                )}
              </FormGroup>

              <FormGroup>
                <PasswordWrapper>
                  <PasswordInput
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="確認密碼 *"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                  <ToggleButton
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? '隱藏密碼' : '顯示密碼'}
                  >
                    {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </ToggleButton>
                </PasswordWrapper>
                <ValidationIndicator
                  isValid={validation.confirmPassword}
                  message={VALIDATION_RULES.confirmPassword.message}
                  errorMessage={VALIDATION_RULES.confirmPassword.errorMessage}
                />
                {errors.confirmPassword && (
                  <ErrorMessage>{errors.confirmPassword}</ErrorMessage>
                )}
              </FormGroup>
            </>
          )}

          <FormGroup>
            <Select
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              disabled={loading}
            >
              <option value="">居住地</option>
              {LOCATION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            {formData.location === '其他' && (
              <Input
                id="customLocation"
                name="customLocation"
                type="text"
                placeholder="請輸入您的居住地"
                value={formData.customLocation}
                onChange={handleInputChange}
                disabled={loading}
                style={{ marginTop: '8px' }}
              />
            )}
          </FormGroup>

          <FormGroup>
            <SectionLabel>出生年月日</SectionLabel>
            <Input
              id="birthDate"
              name="birthDate"
              type="date"
              value={formData.birthDate}
              onChange={handleInputChange}
              disabled={loading}
            />
          </FormGroup>

          <FormGroup>
            <SectionLabel>感興趣的分類</SectionLabel>
            <SectionHint>
              勾選有興趣的分類，我們將在新文章刊出的時候以 email 通知
            </SectionHint>
            <CheckboxGroup>
              {sections.map((section) => (
                <CheckboxItem key={section.id}>
                  <HiddenCheckbox
                    type="checkbox"
                    checked={formData.interestedSectionIds.includes(section.id)}
                    onChange={() => handleSectionToggle(section.id)}
                    disabled={loading}
                  />
                  <CheckboxIcon
                    $checked={formData.interestedSectionIds.includes(
                      section.id
                    )}
                  />
                  {section.name}
                </CheckboxItem>
              ))}
            </CheckboxGroup>
          </FormGroup>

          <FormGroup>
            <NewsletterOptions
              dailyNewsletter={formData.dailyNewsletter}
              weeklyNewsletter={formData.weeklyNewsletter}
              newsletterFormat={formData.newsletterFormat}
              onDailyChange={(checked) =>
                // Daily and weekly can be selected independently
                setFormData((prev) => ({
                  ...prev,
                  dailyNewsletter: checked,
                }))
              }
              onWeeklyChange={(checked) =>
                // Daily and weekly can be selected independently
                setFormData((prev) => ({
                  ...prev,
                  weeklyNewsletter: checked,
                }))
              }
              onFormatChange={(format) =>
                setFormData((prev) => ({ ...prev, newsletterFormat: format }))
              }
            />
          </FormGroup>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <ButtonGroup>
            <PrimaryButton type="submit" disabled={loading}>
              註冊會員
            </PrimaryButton>
            <SecondaryButton
              type="button"
              onClick={handleBack}
              disabled={loading}
            >
              回上一步
            </SecondaryButton>
          </ButtonGroup>
        </Form>
      </ContentWrapper>
    </PageWrapper>
  )
}

RegisterPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <LayoutGeneral
      title="註冊成為會員 - 環境資訊中心"
      description="註冊成為環境資訊中心會員"
    >
      {page}
    </LayoutGeneral>
  )
}

export const getServerSideProps: GetServerSideProps<{
  headerData: Awaited<ReturnType<typeof fetchHeaderData>>
  sections: NotificationSection[]
}> = async ({ res }) => {
  setPrivateCacheControl(res)

  const [headerData, sections] = await Promise.all([
    fetchHeaderData(),
    getAllSections(),
  ])

  return {
    props: {
      headerData,
      sections,
    },
  }
}

export default RegisterPage

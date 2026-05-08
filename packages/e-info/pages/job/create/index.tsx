// 建立環境徵才頁面
import type { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import type { ReactElement } from 'react'
import { useCallback, useRef, useState } from 'react'
import styled from 'styled-components'

import LayoutGeneral from '~/components/layout/layout-general'
import type { TurnstileWidgetHandle } from '~/components/shared/turnstile-widget'
import TurnstileWidget from '~/components/shared/turnstile-widget'
import type { HeaderContextData } from '~/contexts/header-context'
import type { NextPageWithLayout } from '~/pages/_app'
import { setCacheControl } from '~/utils/common'
import { fetchHeaderData } from '~/utils/header-data'

type PageProps = {
  headerData: HeaderContextData
}

const PageWrapper = styled.div`
  background-color: #ffffff;
  min-height: 100vh;
`

const ContentWrapper = styled.div`
  max-width: 640px;
  margin: 0 auto;
  padding: 40px 20px 60px;

  ${({ theme }) => theme.breakpoint.md} {
    padding: 48px 20px 80px;
  }

  ${({ theme }) => theme.breakpoint.xl} {
    padding: 60px 20px 100px;
  }
`

const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 40px;
  gap: 12px;

  ${({ theme }) => theme.breakpoint.md} {
    margin-bottom: 48px;
  }
`

const AccentBar = styled.div`
  background-color: ${({ theme }) => theme.colors.primary[20]};
  width: 60px;
  height: 20px;
  border-bottom-right-radius: 12px;

  ${({ theme }) => theme.breakpoint.md} {
    width: 80px;
    height: 32px;
  }
`

const Title = styled.h1`
  font-size: 18px;
  font-weight: 500;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.primary[20]};
  margin: 0;

  ${({ theme }) => theme.breakpoint.md} {
    font-size: 28px;
    line-height: 32px;
  }
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
`

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const Label = styled.label`
  font-size: 16px;
  font-weight: 500;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.grayscale[0]};
`

const RequiredMark = styled.span`
  color: ${({ theme }) => theme.colors.grayscale[0]};
`

const Input = styled.input`
  padding: 6px 10px;
  font-size: 16px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.grayscale[0]};
  background-color: ${({ theme }) => theme.colors.grayscale[99]};
  box-shadow: 1px 1px 2px 0px rgba(0, 0, 0, 0.05) inset;
  border-radius: 0;
  max-width: 272px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary[20]};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.grayscale[60]};
  }
`

const Textarea = styled.textarea`
  padding: 6px 10px;
  font-size: 16px;
  line-height: 1.8;
  color: ${({ theme }) => theme.colors.grayscale[0]};
  background-color: ${({ theme }) => theme.colors.grayscale[99]};
  box-shadow: 1px 1px 2px 0px rgba(0, 0, 0, 0.05) inset;
  border-radius: 0;
  min-height: 200px;
  resize: vertical;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary[20]};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.grayscale[60]};
  }
`

const ErrorMessage = styled.div`
  font-size: 14px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.error.d};
`

const DateRangeWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 272px;
`

const DateInput = styled(Input)`
  flex: 1;
  max-width: auto;
`

const DateSeparator = styled.span`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.grayscale[0]};
`

const ContactWrapper = styled.div`
  display: flex;
  gap: 12px;
  width: 272px;
  max-width: 100%;
`

const Select = styled.select`
  padding: 6px 32px 6px 10px;
  font-size: 16px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.grayscale[100]};
  background-color: ${({ theme }) => theme.colors.primary[40]};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 16px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary[20]};
  }
`

const ContactSelect = styled(Select)`
  flex: 0 0 auto;
  width: fit-content;
`

const ContactInput = styled(Input)`
  width: 100%;
  max-width: 272px;
`

const SubmitButton = styled.button`
  padding: 12px 40px;
  font-size: 16px;
  line-height: 1.5;
  font-weight: 700;
  color: #fff;
  background-color: ${({ theme }) => theme.colors.secondary[20]};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  width: 100%;
  max-width: 144px;
  align-self: flex-start;
  margin-top: 16px;

  &:hover {
    background-color: ${({ theme }) => theme.colors.secondary[0]};
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.grayscale[60]};
    cursor: not-allowed;
  }

  ${({ theme }) => theme.breakpoint.md} {
    margin-top: 24px;
  }
`

const NoteSection = styled.div`
  margin-top: 40px;
`

const NoteTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.primary[20]};
  margin: 0 0 16px;

  ${({ theme }) => theme.breakpoint.md} {
    font-size: 18px;
  }
`

const NoteList = styled.ol`
  margin: 0;
  padding-left: 1.5em;
  font-size: 14px;
  line-height: 1.8;
  color: ${({ theme }) => theme.colors.grayscale[0]};
  list-style-type: decimal;

  ${({ theme }) => theme.breakpoint.md} {
    font-size: 16px;
  }
`

const NoteItem = styled.li`
  margin-bottom: 8px;

  a {
    color: ${({ theme }) => theme.colors.primary[20]};
    text-decoration: underline;

    &:hover {
      color: ${({ theme }) => theme.colors.primary[0]};
    }
  }
`

type FormData = {
  jobTitle: string
  organization: string
  salary: string
  requirements: string
  jobContent: string
  benefits: string
  applyMethod: string
  applyValue: string
  startDate: string
  endDate: string
}

type FormErrors = {
  jobTitle?: string
  organization?: string
  salary?: string
  requirements?: string
  jobContent?: string
  applyValue?: string
  startDate?: string
  endDate?: string
}

const CreateJobPage: NextPageWithLayout = () => {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    jobTitle: '',
    organization: '',
    salary: '',
    requirements: '',
    jobContent: '',
    benefits: '',
    applyMethod: 'email',
    applyValue: '',
    startDate: '',
    endDate: '',
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const turnstileRef = useRef<TurnstileWidgetHandle>(null)

  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token)
  }, [])

  const handleTurnstileExpire = useCallback(() => {
    setTurnstileToken(null)
    turnstileRef.current?.reset()
  }, [])

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = '請填寫職位名稱'
    }

    if (!formData.organization.trim()) {
      newErrors.organization = '請填寫招募單位'
    }

    if (!formData.salary.trim()) {
      newErrors.salary = '請填寫薪資待遇'
    }

    if (!formData.requirements.trim()) {
      newErrors.requirements = '請填寫需求與條件'
    }

    if (!formData.jobContent.trim()) {
      newErrors.jobContent = '請填寫工作內容'
    }

    if (!formData.applyValue.trim()) {
      newErrors.applyValue = '請填寫應徵方式'
    } else if (formData.applyMethod === 'email') {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.applyValue)) {
        newErrors.applyValue = '請輸入有效的 email 格式'
      }
    } else if (formData.applyMethod === 'website') {
      // Validate URL format
      try {
        new URL(formData.applyValue)
      } catch {
        newErrors.applyValue = '請輸入有效的網址格式（需包含 https://）'
      }
    }

    if (!formData.startDate) {
      newErrors.startDate = '請選擇開始日期'
    }

    if (
      formData.endDate &&
      formData.startDate &&
      formData.endDate < formData.startDate
    ) {
      newErrors.endDate = '結束日期不可早於開始日期'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      // Combine application method
      const applicationMethod = `${formData.applyMethod}: ${formData.applyValue}`

      const response = await fetch('/api/create-job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.jobTitle,
          company: formData.organization,
          salary: formData.salary,
          requirements: formData.requirements,
          jobDescription: formData.jobContent,
          bonus: formData.benefits,
          applicationMethod,
          startDate: formData.startDate,
          endDate: formData.endDate,
          turnstileToken,
        }),
      })

      const result = await response.json()

      if (result.success) {
        router.push('/job/create/done')
      } else {
        alert(result.error || '送出失敗，請重試')
      }
    } catch (error) {
      console.error('Submit error:', error)
      alert('送出失敗，請重試')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PageWrapper>
      <ContentWrapper>
        <SectionTitle>
          <AccentBar />
          <Title>建立環境徵才</Title>
        </SectionTitle>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="jobTitle">
              職位名稱<RequiredMark>*</RequiredMark>
            </Label>
            <Input
              id="jobTitle"
              name="jobTitle"
              type="text"
              value={formData.jobTitle}
              onChange={handleInputChange}
            />
            {errors.jobTitle && <ErrorMessage>{errors.jobTitle}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="organization">
              招募單位<RequiredMark>*</RequiredMark>
            </Label>
            <Input
              id="organization"
              name="organization"
              type="text"
              value={formData.organization}
              onChange={handleInputChange}
            />
            {errors.organization && (
              <ErrorMessage>{errors.organization}</ErrorMessage>
            )}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="salary">
              薪資待遇<RequiredMark>*</RequiredMark>
            </Label>
            <Input
              id="salary"
              name="salary"
              type="text"
              value={formData.salary}
              onChange={handleInputChange}
            />
            {errors.salary && <ErrorMessage>{errors.salary}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="requirements">
              需求與條件<RequiredMark>*</RequiredMark>
            </Label>
            <Input
              id="requirements"
              name="requirements"
              type="text"
              value={formData.requirements}
              onChange={handleInputChange}
            />
            {errors.requirements && (
              <ErrorMessage>{errors.requirements}</ErrorMessage>
            )}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="jobContent">
              工作內容<RequiredMark>*</RequiredMark>
            </Label>
            <Textarea
              id="jobContent"
              name="jobContent"
              value={formData.jobContent}
              onChange={handleInputChange}
              placeholder="請輸入工作內容"
            />
            {errors.jobContent && (
              <ErrorMessage>{errors.jobContent}</ErrorMessage>
            )}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="benefits">加分條件</Label>
            <Input
              id="benefits"
              name="benefits"
              type="text"
              value={formData.benefits}
              onChange={handleInputChange}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="applyMethod">
              應徵方式<RequiredMark>*</RequiredMark>
            </Label>
            <ContactWrapper>
              <ContactSelect
                id="applyMethod"
                name="applyMethod"
                value={formData.applyMethod}
                onChange={handleInputChange}
              >
                <option value="email">email</option>
                <option value="phone">電話</option>
                <option value="website">網站</option>
              </ContactSelect>
              <ContactInput
                id="applyValue"
                name="applyValue"
                type="text"
                value={formData.applyValue}
                onChange={handleInputChange}
                placeholder={
                  formData.applyMethod === 'email'
                    ? '請輸入 email'
                    : formData.applyMethod === 'phone'
                    ? '請輸入電話'
                    : '請輸入網址'
                }
              />
            </ContactWrapper>
            {errors.applyValue && (
              <ErrorMessage>{errors.applyValue}</ErrorMessage>
            )}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="startDate">
              徵才日期<RequiredMark>*</RequiredMark>
            </Label>
            <DateRangeWrapper>
              <DateInput
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleInputChange}
              />
              <DateSeparator>—</DateSeparator>
              <DateInput
                id="endDate"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleInputChange}
              />
            </DateRangeWrapper>
            {(errors.startDate || errors.endDate) && (
              <ErrorMessage>{errors.startDate || errors.endDate}</ErrorMessage>
            )}
          </FormGroup>

          <TurnstileWidget
            ref={turnstileRef}
            onVerify={handleTurnstileVerify}
            onExpire={handleTurnstileExpire}
          />

          <SubmitButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? '送出中...' : '送出'}
          </SubmitButton>
        </Form>

        <NoteSection>
          <NoteTitle>注意事項</NoteTitle>
          <NoteList>
            <NoteItem>徵才內容建立完成，通過審核將予以發佈。</NoteItem>
            <NoteItem>
              環境資訊中心保留決定公布與否之權力，若與環境相關性過低，將不予公布。
            </NoteItem>
            <NoteItem>
              相關問題請來信至
              <a href="mailto:infor@e-info.org.tw">infor@e-info.org.tw</a>
              ，我們將盡速為您解答。
            </NoteItem>
            <NoteItem>
              若有急件，請來信
              <a href="mailto:lishin_0426@e-info.org.tw">
                lishin_0426@e-info.org.tw
              </a>{' '}
              陳小姐。
            </NoteItem>
          </NoteList>
        </NoteSection>
      </ContentWrapper>
    </PageWrapper>
  )
}

CreateJobPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <LayoutGeneral
      title="建立環境徵才 - 環境資訊中心"
      description="建立環境徵才"
    >
      {page}
    </LayoutGeneral>
  )
}

export const getServerSideProps: GetServerSideProps<PageProps> = async ({
  res,
}) => {
  setCacheControl(res)

  const headerData = await fetchHeaderData()

  return {
    props: {
      headerData,
    },
  }
}

export default CreateJobPage

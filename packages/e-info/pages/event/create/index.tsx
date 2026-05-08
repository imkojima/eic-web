// 建立活動頁面
import type { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import type { ReactElement, ReactNode } from 'react'
import { useCallback, useRef, useState } from 'react'
import styled from 'styled-components'

import LayoutGeneral from '~/components/layout/layout-general'
import type { TurnstileWidgetHandle } from '~/components/shared/turnstile-widget'
import TurnstileWidget from '~/components/shared/turnstile-widget'
import { EVENT_CITY_OPTIONS } from '~/constants/auth'
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

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary[20]};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.grayscale[60]};
  }
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

const FileInputWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const FileInputLeftWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
`

const FileInputButton = styled.label`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 10px;
  font-size: 16px;
  line-height: 1.5;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.grayscale[60]};
  background-color: ${({ theme }) => theme.colors.grayscale[99]};
  border: 1px solid ${({ theme }) => theme.colors.grayscale[95]};
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    background-color: ${({ theme }) => theme.colors.grayscale[95]};
  }
`

const UploadButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 20px;
  font-size: 16px;
  line-height: 1.5;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.grayscale[100]};
  background-color: ${({ theme }) => theme.colors.primary[40]};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary[0]};
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.grayscale[60]};
    cursor: not-allowed;
    opacity: 0.5;
  }
`

const HiddenFileInput = styled.input`
  display: none;
`

const FileInfo = styled.div`
  font-size: 14px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.grayscale[40]};
`

const ErrorMessageWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.error.d};
`

const CrossIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
    <path d="M11 4l-1-1-3 3-3-3-1 1 3 3-3 3 1 1 3-3 3 3 1-1-3-3 3-3z" />
  </svg>
)

const ErrorMessage = ({ children }: { children: ReactNode }) => (
  <ErrorMessageWrapper>
    <CrossIcon />
    {children}
  </ErrorMessageWrapper>
)

const DateRangeWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const DateInput = styled(Input)`
  flex: 1;
`

const DateSeparator = styled.span`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.grayscale[0]};
`

const ContactWrapper = styled.div`
  display: flex;
  gap: 12px;
`

const ContactSelect = styled(Select)`
  flex: 0 0 auto;
  min-width: 120px;
`

const ContactInput = styled(Input)`
  flex: 1;
`

const EventTypeSelect = styled(Select)`
  width: fit-content;
  min-width: 180px;
`

const LocationWrapper = styled.div`
  display: flex;
  gap: 12px;
`

const LocationSelect = styled(Select)`
  flex: 0 0 auto;
  min-width: 120px;
`

const LocationInput = styled(Input)`
  flex: 1;
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
  name: string
  image: File | null
  organizer: string
  contactMethod: string
  contactValue: string
  city: string
  eventType: string
  startDate: string
  endDate: string
  locationMethod: string
  locationValue: string
  fee: string
  registrationUrl: string
  content: string
}

type FormErrors = {
  name?: string
  image?: string
  organizer?: string
  contactValue?: string
  city?: string
  eventType?: string
  startDate?: string
  endDate?: string
  locationValue?: string
  fee?: string
  registrationUrl?: string
  content?: string
}

const CreateEventPage: NextPageWithLayout = () => {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    name: '',
    image: null,
    organizer: '',
    contactMethod: 'email',
    contactValue: '',
    city: '',
    eventType: 'course_camp_workshop',
    startDate: '',
    endDate: '',
    locationMethod: '實體',
    locationValue: '',
    fee: '',
    registrationUrl: '',
    content: '',
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [fileName, setFileName] = useState<string>('')
  const [imageError, setImageError] = useState<string>('')
  const [photoId, setPhotoId] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setImageError('')
    // Reset upload state when selecting a new file
    setUploadSuccess(false)
    setPhotoId('')

    if (file) {
      // Check file size (4MB = 4 * 1024 * 1024 bytes)
      const maxSize = 4 * 1024 * 1024
      if (file.size > maxSize) {
        setImageError('檔案超過上限，請重新上傳')
        setFileName('')
        setFormData((prev) => ({ ...prev, image: null }))
        return
      }

      setFileName(file.name)
      setFormData((prev) => ({ ...prev, image: file }))
      if (errors.image) {
        setErrors((prev) => ({ ...prev, image: undefined }))
      }
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = '請填寫活動名稱'
    } else if (formData.name.length > 40) {
      newErrors.name = '活動名稱不可超過40字'
    }

    if (!photoId) {
      newErrors.image = '請上傳封面圖片'
    }

    if (!formData.organizer.trim()) {
      newErrors.organizer = '請填寫主辦單位'
    }

    if (!formData.contactValue.trim()) {
      newErrors.contactValue = '請填寫聯絡方式'
    } else if (formData.contactMethod === 'email') {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.contactValue)) {
        newErrors.contactValue = '請輸入有效的 email 格式'
      }
    } else if (formData.contactMethod === 'website') {
      // Validate URL format
      try {
        new URL(formData.contactValue)
      } catch {
        newErrors.contactValue = '請輸入有效的網址格式（需包含 https://）'
      }
    }

    if (!formData.city) {
      newErrors.city = '請選擇活動縣市'
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

    if (formData.locationMethod === '實體' && !formData.locationValue.trim()) {
      newErrors.locationValue = '請填寫活動地點'
    }

    if (!formData.fee.trim()) {
      newErrors.fee = '請填寫活動費用'
    }

    if (!formData.registrationUrl.trim()) {
      newErrors.registrationUrl = '請填寫報名網址'
    } else {
      // Validate URL format
      try {
        new URL(formData.registrationUrl)
      } catch {
        newErrors.registrationUrl = '請輸入有效的網址格式（需包含 https://）'
      }
    }

    if (!formData.content.trim()) {
      newErrors.content = '請填寫活動內容'
    } else if (formData.content.length > 1000) {
      newErrors.content = '活動內容不可超過1000字'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleUpload = async () => {
    if (!formData.image) return

    setIsUploading(true)
    setImageError('')
    setUploadSuccess(false)

    try {
      const uploadFormData = new window.FormData()
      uploadFormData.append('file', formData.image)
      uploadFormData.append('name', formData.image.name)
      if (turnstileToken) {
        uploadFormData.append('turnstileToken', turnstileToken)
      }

      const response = await fetch('/api/upload-photo', {
        method: 'POST',
        body: uploadFormData,
      })

      const result = await response.json()

      if (result.success && result.photoId) {
        setPhotoId(result.photoId)
        setUploadSuccess(true)
        // Reset Turnstile to get a fresh token for form submission
        turnstileRef.current?.reset()
        if (errors.image) {
          setErrors((prev) => ({ ...prev, image: undefined }))
        }
      } else {
        setImageError(result.error || '上傳失敗，請重試')
      }
    } catch (error) {
      console.error('Upload error:', error)
      setImageError('上傳失敗，請重試')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      // Combine contact info
      const contactInfo = `${formData.contactMethod}: ${formData.contactValue}`
      // Combine location
      const location =
        formData.locationMethod === '實體'
          ? `${formData.locationMethod}: ${formData.locationValue}`
          : formData.locationMethod

      const response = await fetch('/api/create-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          photoId,
          organizer: formData.organizer,
          contactInfo,
          city: formData.city,
          eventType: formData.eventType,
          startDate: formData.startDate,
          endDate: formData.endDate,
          location,
          fee: formData.fee,
          registrationUrl: formData.registrationUrl,
          content: formData.content,
          turnstileToken,
        }),
      })

      const result = await response.json()

      if (result.success) {
        router.push('/event/create/done')
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
          <Title>建立活動</Title>
        </SectionTitle>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="name">
              活動名稱 (40 字內)<RequiredMark>*</RequiredMark>
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
            />
            {formData.name.length > 40 && (
              <ErrorMessage>超過字數！</ErrorMessage>
            )}
            {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="image">
              封面圖片 (圖片限 4MB 內)<RequiredMark>*</RequiredMark>
            </Label>
            <FileInputWrapper>
              <FileInputLeftWrapper>
                <FileInputButton htmlFor="image">選擇檔案</FileInputButton>
                <HiddenFileInput
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <FileInfo>{fileName || '沒有選擇檔案'}</FileInfo>
                <UploadButton
                  type="button"
                  disabled={!formData.image || isUploading || uploadSuccess}
                  onClick={handleUpload}
                >
                  {isUploading
                    ? '上傳中...'
                    : uploadSuccess
                    ? '已上傳'
                    : '上傳'}
                </UploadButton>
              </FileInputLeftWrapper>
            </FileInputWrapper>
            {imageError && <ErrorMessage>{imageError}</ErrorMessage>}
            {errors.image && <ErrorMessage>{errors.image}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="organizer">
              主辦單位<RequiredMark>*</RequiredMark>
            </Label>
            <Input
              id="organizer"
              name="organizer"
              type="text"
              value={formData.organizer}
              onChange={handleInputChange}
            />
            {errors.organizer && (
              <ErrorMessage>{errors.organizer}</ErrorMessage>
            )}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="contactMethod">
              聯絡方式<RequiredMark>*</RequiredMark>
            </Label>
            <ContactWrapper>
              <ContactSelect
                id="contactMethod"
                name="contactMethod"
                value={formData.contactMethod}
                onChange={handleInputChange}
              >
                <option value="email">email</option>
                <option value="phone">電話</option>
                <option value="website">網站</option>
              </ContactSelect>
              <ContactInput
                id="contactValue"
                name="contactValue"
                type="text"
                value={formData.contactValue}
                onChange={handleInputChange}
                placeholder={
                  formData.contactMethod === 'email'
                    ? '請輸入 email'
                    : formData.contactMethod === 'phone'
                    ? '請輸入電話'
                    : '請輸入網址'
                }
              />
            </ContactWrapper>
            {errors.contactValue && (
              <ErrorMessage>{errors.contactValue}</ErrorMessage>
            )}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="city">
              活動縣市<RequiredMark>*</RequiredMark>
            </Label>
            <EventTypeSelect
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
            >
              <option value="">請選擇縣市</option>
              {EVENT_CITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </EventTypeSelect>
            {errors.city && <ErrorMessage>{errors.city}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="eventType">
              活動類型<RequiredMark>*</RequiredMark>
            </Label>
            <EventTypeSelect
              id="eventType"
              name="eventType"
              value={formData.eventType}
              onChange={handleInputChange}
            >
              <option value="course_camp_workshop">課程/營隊/工作坊</option>
              <option value="lecture_forum">演講/座談會</option>
              <option value="seminar">研討會</option>
              <option value="exhibition_preview">展覽/節目預告</option>
              <option value="action_participation">行動參與</option>
              <option value="call_for_entries">徵件</option>
              <option value="other">其他</option>
            </EventTypeSelect>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="startDate">
              活動日期<RequiredMark>*</RequiredMark>
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

          <FormGroup>
            <Label htmlFor="locationMethod">
              活動地點<RequiredMark>*</RequiredMark>
            </Label>
            <LocationWrapper>
              <LocationSelect
                id="locationMethod"
                name="locationMethod"
                value={formData.locationMethod}
                onChange={handleInputChange}
              >
                <option value="實體">實體</option>
                <option value="線上">線上</option>
                <option value="其他">其他</option>
              </LocationSelect>
              {formData.locationMethod === '實體' && (
                <LocationInput
                  id="locationValue"
                  name="locationValue"
                  type="text"
                  value={formData.locationValue}
                  onChange={handleInputChange}
                  placeholder="請輸入地點資訊"
                />
              )}
            </LocationWrapper>
            {errors.locationValue && (
              <ErrorMessage>{errors.locationValue}</ErrorMessage>
            )}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="fee">
              活動費用<RequiredMark>*</RequiredMark>
            </Label>
            <Input
              id="fee"
              name="fee"
              type="text"
              value={formData.fee}
              onChange={handleInputChange}
              placeholder="例：免費、100元、200-500元"
            />
            {errors.fee && <ErrorMessage>{errors.fee}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="registrationUrl">
              報名網址<RequiredMark>*</RequiredMark>
            </Label>
            <Input
              id="registrationUrl"
              name="registrationUrl"
              type="url"
              value={formData.registrationUrl}
              onChange={handleInputChange}
              placeholder="https://"
            />
            {errors.registrationUrl && (
              <ErrorMessage>{errors.registrationUrl}</ErrorMessage>
            )}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="content">
              內容 (1000 字內)<RequiredMark>*</RequiredMark>
            </Label>
            <Textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder="請輸入活動詳細內容"
            />
            {formData.content.length > 1000 && (
              <ErrorMessage>活動內容不可超過1000字</ErrorMessage>
            )}
            {errors.content && <ErrorMessage>{errors.content}</ErrorMessage>}
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
            <NoteItem>活動內容建立完成，通過審核將予以發佈。</NoteItem>
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

CreateEventPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <LayoutGeneral title="建立活動 - 環境資訊中心" description="建立環境活動">
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

export default CreateEventPage

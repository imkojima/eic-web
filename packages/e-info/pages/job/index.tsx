// 徵才列表頁面
import type { GetServerSideProps } from 'next'
import Link from 'next/link'
import type { ReactElement } from 'react'
import { useState } from 'react'
import styled from 'styled-components'

import { getGqlClient } from '~/apollo-client'
import LayoutGeneral from '~/components/layout/layout-general'
import { MAX_CONTENT_WIDTH } from '~/constants/layout'
import type { HeaderContextData } from '~/contexts/header-context'
import type { Job } from '~/graphql/query/job'
import { jobs as jobsQuery } from '~/graphql/query/job'
import type { NextPageWithLayout } from '~/pages/_app'
import IconBack from '~/public/icons/arrow_back.svg'
import IconForward from '~/public/icons/arrow_forward.svg'
import { setCacheControl } from '~/utils/common'
import * as gtag from '~/utils/gtag'
import { fetchHeaderData } from '~/utils/header-data'

const PageWrapper = styled.div`
  background-color: #ffffff;
  min-height: 100vh;
  padding: 40px 20px 60px;

  ${({ theme }) => theme.breakpoint.md} {
    padding: 48px 98px 80px;
  }

  ${({ theme }) => theme.breakpoint.xl} {
    padding: 60px 0 100px;
  }
`

const ContentWrapper = styled.div`
  max-width: ${MAX_CONTENT_WIDTH};
  margin: 0 auto;

  ${({ theme }) => theme.breakpoint.xl} {
    padding: 0 58px;
  }
`

const SectionTitle = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 28px;
  gap: 20px;

  ${({ theme }) => theme.breakpoint.md} {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`

const TitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const AccentBar = styled.div`
  background-color: ${({ theme }) => theme.colors.primary[20]};
  width: 60px;
  height: 20px;
  margin-right: 0.75rem;
  border-bottom-right-radius: 12px;

  // Desktop
  @media (min-width: ${({ theme }) => theme.mediaSize.xl}px) {
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

  // Desktop
  @media (min-width: ${({ theme }) => theme.mediaSize.xl}px) {
    font-size: 28px;
    line-height: 32px;
  }
`

const JobGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 28px;

  ${({ theme }) => theme.breakpoint.md} {
    grid-template-columns: repeat(2, 1fr);
    gap: 36px;
  }

  ${({ theme }) => theme.breakpoint.xl} {
    grid-template-columns: repeat(3, 1fr);
    gap: 36px;
  }
`

const JobCard = styled.span`
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.grayscale[80]};
  border-radius: 8px;
  overflow: hidden;
  text-decoration: none;
  cursor: pointer;
`

const JobContent = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex: 1;
`

const JobDate = styled.div`
  color: ${({ theme }) => theme.colors.primary[20]};
  font-size: 14px;
  line-height: 1.5;
  font-weight: 500;
  margin-bottom: 12px;

  ${({ theme }) => theme.breakpoint.md} {
    font-size: 16px;
  }
`

const JobTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.grayscale[0]};
  margin: 0 0 12px 0;
  line-height: 1.4;

  ${({ theme }) => theme.breakpoint.md} {
    font-size: 22px;
  }
`

const JobCompany = styled.div`
  color: ${({ theme }) => theme.colors.primary[20]};
  font-size: 14px;
  line-height: 1.5;
  font-weight: 400;
  margin: 0 0 16px 0;

  ${({ theme }) => theme.breakpoint.md} {
    font-size: 16px;
  }
`

const JobDescription = styled.div`
  color: ${({ theme }) => theme.colors.grayscale[40]};
  font-size: 14px;
  font-weight: 400;
  line-height: 1.6;
  margin-bottom: 20px;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;

  ${({ theme }) => theme.breakpoint.md} {
    font-size: 15px;
  }
`

const ViewMoreButton = styled.div`
  background-color: ${({ theme }) => theme.colors.primary[0]};
  color: #fff;
  font-size: 14px;
  line-height: 1.5;
  font-weight: 500;
  padding: 6px 40px;
  border-radius: 4px;
  text-align: center;
  transition: background-color 0.2s ease;
  align-self: center;

  ${JobCard}:hover & {
    background-color: ${({ theme }) => theme.colors.primary[20]};
  }

  ${({ theme }) => theme.breakpoint.md} {
    font-size: 16px;
  }
`

const PaginationWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 13px;
  margin-top: 48px;

  ${({ theme }) => theme.breakpoint.md} {
    margin-top: 60px;
  }
`

const BackForwardButton = styled.button<{ $isDisabled?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 25px;
  height: 25px;
  border: none;
  background: none;
  cursor: ${({ $isDisabled }) => ($isDisabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ $isDisabled }) => ($isDisabled ? 0.3 : 1)};
  padding: 0;

  > svg {
    width: 25px;
    height: 25px;
  }

  ${({ theme }) => theme.breakpoint.md} {
    min-width: 40px;
    height: 40px;

    > svg {
      width: 40px;
      height: 40px;
    }
  }
`

const PaginationButton = styled.button<{
  $isActive?: boolean
  $isLarge?: boolean
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: 1px solid;
  border-color: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.grayscale[0] : theme.colors.primary[20]};
  background: #fff;
  color: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.grayscale[0] : theme.colors.primary[20]};
  font-size: ${({ $isLarge }) => ($isLarge ? '8px' : '10px')};
  font-weight: 500;
  line-height: 1.5;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 11px;

  &:hover {
    background: ${({ theme }) => theme.colors.primary[20]};
    border-color: ${({ theme }) => theme.colors.primary[20]};
    color: #fff;
  }

  ${({ theme }) => theme.breakpoint.md} {
    min-width: 36px;
    height: 36px;
    font-size: ${({ $isLarge }) => ($isLarge ? '12px' : '16px')};
    font-weight: 700;
    border-radius: 18px;
  }
`

const PaginationEllipsis = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 40px;
  color: ${({ theme }) => theme.colors.primary[20]};
  font-size: 14px;

  ${({ theme }) => theme.breakpoint.xl} {
    min-width: 48px;
    height: 48px;
    font-size: 16px;
  }
`

const SubmitButton = styled.a`
  padding: 4px 10px;
  font-size: 16px;
  line-height: 1.5;
  font-weight: 400;
  color: #fff;
  background-color: ${({ theme }) => theme.colors.secondary[20]};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
  transition: background-color 0.2s ease;
  text-align: center;

  &:hover {
    background-color: ${({ theme }) => theme.colors.secondary[0]};
  }
`

const EmptyMessage = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${({ theme }) => theme.colors.grayscale[40]};
  font-size: 16px;
`

type PageProps = {
  headerData: HeaderContextData
  jobs: Job[]
}

// Format date as yyyy年mm月dd日
const formatDate = (dateString?: string): string => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}年${month}月${day}日`
}

// Strip HTML tags and get plain text excerpt
const getExcerpt = (html?: string, maxLength = 150): string => {
  if (!html) return ''
  const text = html.replace(/<[^>]*>/g, '').trim()
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const JobsPage: NextPageWithLayout<PageProps> = ({ jobs }) => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9 // 9 jobs per page (3x3 grid)
  const totalPages = Math.ceil(jobs.length / itemsPerPage)

  // Calculate current jobs to display
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentJobs = jobs.slice(startIndex, endIndex)

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    gtag.sendEvent('jobs', 'click', `pagination-page-${page}`)
  }

  // Generate page numbers for pagination (matching category page style)
  const generatePaginationItems = (): (number | 'ellipsis')[] => {
    const items: (number | 'ellipsis')[] = []

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i)
      }
      return items
    }

    // Always show first page
    items.push(1)

    if (currentPage > 3) {
      items.push('ellipsis')
    }

    // Show pages around current page
    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)

    for (let i = start; i <= end; i++) {
      items.push(i)
    }

    if (currentPage < totalPages - 2) {
      items.push('ellipsis')
    }

    // Always show last page
    if (totalPages > 1) {
      items.push(totalPages)
    }

    return items
  }

  const paginationItems = generatePaginationItems()

  return (
    <PageWrapper>
      <ContentWrapper>
        <SectionTitle>
          <TitleGroup>
            <AccentBar />
            <Title>徵才</Title>
          </TitleGroup>
          <SubmitButton
            href="/job/create"
            onClick={() => gtag.sendEvent('jobs', 'click', 'submit-job')}
          >
            我要刊登
          </SubmitButton>
        </SectionTitle>

        {jobs.length === 0 ? (
          <EmptyMessage>目前沒有徵才資訊</EmptyMessage>
        ) : (
          <JobGrid>
            {currentJobs.map((job) => (
              <Link key={job.id} href={`/job/${job.id}`}>
                <JobCard
                  onClick={() => gtag.sendEvent('jobs', 'click', job.title)}
                >
                  <JobContent>
                    <JobDate>{formatDate(job.createdAt)}</JobDate>
                    <JobTitle>{job.title}</JobTitle>
                    <JobCompany>{job.company || ''}</JobCompany>
                    <JobDescription>
                      {getExcerpt(job.jobDescription)}
                    </JobDescription>
                    <ViewMoreButton>查看更多</ViewMoreButton>
                  </JobContent>
                </JobCard>
              </Link>
            ))}
          </JobGrid>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <PaginationWrapper>
            <BackForwardButton
              $isDisabled={currentPage === 1}
              onClick={() => {
                if (currentPage > 1) {
                  handlePageChange(currentPage - 1)
                }
              }}
            >
              <IconBack />
            </BackForwardButton>

            {paginationItems.map((item, index) =>
              item === 'ellipsis' ? (
                <PaginationEllipsis key={`ellipsis-${index}`}>
                  ......
                </PaginationEllipsis>
              ) : (
                <PaginationButton
                  key={item}
                  $isActive={item === currentPage}
                  $isLarge={item >= 1000}
                  onClick={() => handlePageChange(item)}
                >
                  {String(item).padStart(2, '0')}
                </PaginationButton>
              )
            )}

            <BackForwardButton
              $isDisabled={currentPage === totalPages}
              onClick={() => {
                if (currentPage < totalPages) {
                  handlePageChange(currentPage + 1)
                }
              }}
            >
              <IconForward />
            </BackForwardButton>
          </PaginationWrapper>
        )}
      </ContentWrapper>
    </PageWrapper>
  )
}

JobsPage.getLayout = function getLayout(page: ReactElement) {
  return <LayoutGeneral title="徵才">{page}</LayoutGeneral>
}

export const getServerSideProps: GetServerSideProps<PageProps> = async ({
  res,
}) => {
  setCacheControl(res)

  const client = getGqlClient()

  const [headerData, jobsResult] = await Promise.all([
    fetchHeaderData(),
    client.query<{ jobs: Job[] }>({
      query: jobsQuery,
      variables: { take: 500 }, // Fetch all jobs for client-side pagination
    }),
  ])

  return {
    props: {
      headerData,
      jobs: jobsResult.data?.jobs || [],
    },
  }
}

export default JobsPage

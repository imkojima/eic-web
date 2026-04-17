// 活動列表頁面
import type { GetServerSideProps } from 'next'
import Link from 'next/link'
import type { ReactElement } from 'react'
import { useState } from 'react'
import styled from 'styled-components'

import { getGqlClient } from '~/apollo-client'
import LayoutGeneral from '~/components/layout/layout-general'
import { LOCATION_OPTIONS } from '~/constants/auth'
import { DEFAULT_EVENT_IMAGE_PATH } from '~/constants/constant'
import { MAX_CONTENT_WIDTH } from '~/constants/layout'
import type { HeaderContextData } from '~/contexts/header-context'
import type { Event } from '~/graphql/query/event'
import { events as eventsQuery } from '~/graphql/query/event'
import type { NextPageWithLayout } from '~/pages/_app'
import IconBack from '~/public/icons/arrow_back.svg'
import IconForward from '~/public/icons/arrow_forward.svg'
import { setCacheControl } from '~/utils/common'
import * as gtag from '~/utils/gtag'
import { fetchHeaderData } from '~/utils/header-data'

const PageWrapper = styled.div`
  background-color: ${({ theme }) => theme.colors.primary[20]};
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
  align-items: center;
  justify-content: center;
  margin-bottom: 28px;
  gap: 12px;

  ${({ theme }) => theme.breakpoint.xl} {
    justify-content: flex-start;
  }
`

const AccentBar = styled.div`
  background-color: ${({ theme }) => theme.colors.secondary[80]};
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
  color: ${({ theme }) => theme.colors.secondary[80]};
  margin: 0;

  // Desktop
  @media (min-width: ${({ theme }) => theme.mediaSize.xl}px) {
    font-size: 28px;
    line-height: 32px;
  }
`

const EventGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;

  ${({ theme }) => theme.breakpoint.md} {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }

  ${({ theme }) => theme.breakpoint.xl} {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
`

const EventCard = styled.a`
  display: block;
  background: #fff;
  overflow: hidden;
  text-decoration: none;
  cursor: pointer;
`

const EventImage = styled.div<{ $image: string }>`
  width: 100%;
  aspect-ratio: 4 / 3;
  background-image: url(${({ $image }) => $image});
  background-size: cover;
  background-position: center;
`

const EventContent = styled.div`
  padding: 10px 20px;
`

const EventTitle = styled.h2`
  font-size: 28px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.grayscale[0]};
  margin: 0 0 12px 0;
  line-height: 32px;
`

const EventDate = styled.div`
  color: ${({ theme }) => theme.colors.primary[20]};
  font-size: 20px;
  line-height: 28px;
  font-weight: 700;
  margin: 0 0 12px 0;
`

const EventOrganizer = styled.div`
  color: ${({ theme }) => theme.colors.grayscale[0]};
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
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
  background: none;
  border: none;
  cursor: ${({ $isDisabled }) => ($isDisabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ $isDisabled }) => ($isDisabled ? 0.3 : 1)};
  padding: 0;
  color: #fff;

  > svg {
    width: 25px;
    height: 25px;

    path {
      fill: currentColor;
    }
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
    $isActive ? '#c4956a' : theme.colors.primary[95]};
  background: transparent;
  color: ${({ $isActive, theme }) =>
    $isActive ? '#c4956a' : theme.colors.primary[95]};
  font-size: ${({ $isLarge }) => ($isLarge ? '8px' : '10px')};
  font-weight: 500;
  line-height: 1.5;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 50%;

  &:hover:not([disabled]) {
    border-color: #fff;
    color: #fff;
  }

  ${({ theme }) => theme.breakpoint.md} {
    min-width: 36px;
    height: 36px;
    font-size: ${({ $isLarge }) => ($isLarge ? '12px' : '16px')};
    font-weight: 700;
  }
`

const PaginationEllipsis = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  color: #fff;
  font-size: 16px;
  line-height: 1.5;
  font-weight: 700;

  ${({ theme }) => theme.breakpoint.md} {
    min-width: 36px;
    height: 36px;
    font-size: 16px;
  }
`

const FilterBar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 32px;

  ${({ theme }) => theme.breakpoint.md} {
    flex-direction: row;
    align-items: center;
    gap: 20px;
  }
`

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  ${({ theme }) => theme.breakpoint.md} {
    justify-content: flex-start;
    gap: 12px;
  }
`

const FilterLabel = styled.label`
  font-size: 16px;
  line-heigth: 1.5;
  font-weight: 700;
  color: #ffffff;
  white-space: nowrap;
  min-width: 70px;

  ${({ theme }) => theme.breakpoint.md} {
    font-size: 16px;
    min-width: auto;
  }
`

const Select = styled.select`
  padding: 0 22px 0 8px;
  font-size: 16px;
  background-color: #fff;
  border: 1px solid ${({ theme }) => theme.colors.grayscale[60]};
  border-radius: 0;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 16px;
  min-width: 128px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary[0]};
  }

  ${({ theme }) => theme.breakpoint.md} {
    padding: 0 22px 0 8px;
    font-size: 15px;
    min-width: 140px;
    background-size: 18px;
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
  align-self: center;
  width: fit-content;

  &:hover {
    background-color: ${({ theme }) => theme.colors.secondary[0]};
  }

  ${({ theme }) => theme.breakpoint.md} {
    margin-left: auto;
    align-self: auto;
  }
`

type PageProps = {
  headerData: HeaderContextData
  events: Event[]
}

const EventsPage: NextPageWithLayout<PageProps> = ({ events }) => {
  // Filter state
  const [selectedLocation, setSelectedLocation] = useState('all')
  const [selectedDate, setSelectedDate] = useState('all')

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9 // 9 events per page (3x3 grid)

  // Use fixed city/county options for location filter
  const locationOptions = LOCATION_OPTIONS

  // Generate date options from events data (YYYY-MM format)
  const dateOptions = Array.from(
    new Set(
      events
        .map((event) => {
          if (!event.startDate) return null
          const date = new Date(event.startDate)
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
            2,
            '0'
          )}`
        })
        .filter((date): date is string => !!date)
    )
  ).sort((a, b) => b.localeCompare(a)) // Sort descending (newest first)

  // Format date to yyyy年mm月dd日
  const formatDate = (dateString?: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}年${month}月${day}日`
  }

  // Get image URL with fallback
  const getImageUrl = (event: Event) => {
    return (
      event.heroImage?.resized?.w480 ||
      event.heroImage?.resized?.original ||
      DEFAULT_EVENT_IMAGE_PATH
    )
  }

  // Format date option for display (YYYY-MM -> YYYY年MM月)
  const formatDateOption = (dateString: string) => {
    const [year, month] = dateString.split('-')
    return `${year}年${month}月`
  }

  // Normalize 台/臺 variants for comparison
  const normalizeCity = (str: string) => str.replace(/臺/g, '台')

  // Filter events based on selected filters
  const filteredEvents = events.filter((event) => {
    // City filter (with 台/臺 normalization)
    if (selectedLocation !== 'all') {
      if (
        !event.city ||
        normalizeCity(event.city) !== normalizeCity(selectedLocation)
      ) {
        return false
      }
    }

    // Date filter (format: YYYY-MM)
    if (selectedDate !== 'all') {
      if (!event.startDate) return false
      const eventDate = new Date(event.startDate)
      const eventYearMonth = `${eventDate.getFullYear()}-${String(
        eventDate.getMonth() + 1
      ).padStart(2, '0')}`
      if (eventYearMonth !== selectedDate) {
        return false
      }
    }

    return true
  })

  // Calculate pagination based on filtered events
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentEvents = filteredEvents.slice(startIndex, endIndex)

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    gtag.sendEvent('events', 'click', `pagination-page-${page}`)
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
          <AccentBar />
          <Title>活動</Title>
        </SectionTitle>

        <FilterBar>
          <FilterGroup>
            <FilterLabel htmlFor="location-filter">活動地點</FilterLabel>
            <Select
              id="location-filter"
              value={selectedLocation}
              onChange={(e) => {
                setSelectedLocation(e.target.value)
                setCurrentPage(1)
                gtag.sendEvent('events', 'filter', `location-${e.target.value}`)
              }}
            >
              <option value="all">全部</option>
              {locationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel htmlFor="date-filter">日期</FilterLabel>
            <Select
              id="date-filter"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value)
                setCurrentPage(1)
                gtag.sendEvent('events', 'filter', `date-${e.target.value}`)
              }}
            >
              <option value="all">全部</option>
              {dateOptions.map((date) => (
                <option key={date} value={date}>
                  {formatDateOption(date)}
                </option>
              ))}
            </Select>
          </FilterGroup>

          <SubmitButton
            href="/event/create"
            onClick={() => gtag.sendEvent('events', 'click', 'submit-event')}
          >
            我要刊登
          </SubmitButton>
        </FilterBar>

        <EventGrid>
          {currentEvents.map((event) => (
            <Link
              key={event.id}
              href={`/event/${event.id}`}
              passHref
              legacyBehavior
            >
              <EventCard
                onClick={() => gtag.sendEvent('events', 'click', event.name)}
              >
                <EventImage $image={getImageUrl(event)} />
                <EventContent>
                  <EventDate>{formatDate(event.startDate)}</EventDate>
                  <EventTitle>{event.name}</EventTitle>
                  <EventOrganizer>{event.organizer || ''}</EventOrganizer>
                </EventContent>
              </EventCard>
            </Link>
          ))}
        </EventGrid>
      </ContentWrapper>
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
    </PageWrapper>
  )
}

EventsPage.getLayout = function getLayout(page: ReactElement) {
  return <LayoutGeneral title="活動">{page}</LayoutGeneral>
}

export const getServerSideProps: GetServerSideProps<PageProps> = async ({
  res,
}) => {
  setCacheControl(res)

  const client = getGqlClient()

  // Fetch more events for client-side filtering
  const [headerData, eventsResult] = await Promise.all([
    fetchHeaderData(),
    client.query<{ events: Event[] }>({
      query: eventsQuery,
      variables: { take: 100, skip: 0 },
    }),
  ])

  return {
    props: {
      headerData,
      events: eventsResult.data?.events || [],
    },
  }
}

export default EventsPage

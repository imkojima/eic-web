import type { GetServerSideProps } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import type { ReactElement } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'

import LayoutGeneral from '~/components/layout/layout-general'
import MemberPageTitle from '~/components/member/member-page-title'
import { DEFAULT_POST_IMAGE_PATH } from '~/constants/constant'
import { MAX_CONTENT_WIDTH } from '~/constants/layout'
import { useAuth } from '~/hooks/useAuth'
import type {
  FavoriteWithPost,
  MemberFavoriteStats,
} from '~/lib/graphql/member'
import {
  getMemberFavorites,
  getMemberFavoriteStats,
} from '~/lib/graphql/member'
import type { NextPageWithLayout } from '~/pages/_app'
import IconFavorite from '~/public/icons/favorite.svg'
import { setPrivateCacheControl } from '~/utils/common'
import { fetchHeaderData } from '~/utils/header-data'
import { formatPostDate } from '~/utils/post'

const PageWrapper = styled.div`
  background-color: #ffffff;
  min-height: 100vh;
`

const ContentWrapper = styled.div`
  max-width: ${MAX_CONTENT_WIDTH};
  margin: 0 auto;
  padding: 32px 20px 60px;

  ${({ theme }) => theme.breakpoint.md} {
    padding: 60px 20px 100px;
    display: flex;
    gap: 60px;
  }

  ${({ theme }) => theme.breakpoint.xl} {
    gap: 80px;
  }
`

const Sidebar = styled.nav`
  display: none;

  ${({ theme }) => theme.breakpoint.md} {
    display: block;
    width: 120px;
    flex-shrink: 0;
  }
`

const SidebarList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

type SidebarItemProps = {
  $isActive?: boolean
}

const SidebarItem = styled.li<SidebarItemProps>`
  a {
    display: block;
    padding: 8px 0;
    font-size: 16px;
    font-weight: ${({ $isActive }) => ($isActive ? '700' : '400')};
    line-height: 1.5;
    color: ${({ theme, $isActive }) =>
      $isActive ? theme.colors.primary[40] : theme.colors.grayscale[40]};
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      color: ${({ theme }) => theme.colors.primary[40]};
    }
  }
`

const MobileNav = styled.nav`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px 24px;
  padding-bottom: 24px;
  margin-bottom: 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grayscale[95]};

  ${({ theme }) => theme.breakpoint.md} {
    display: none;
  }
`

const MobileNavItem = styled(Link)<{ $isActive?: boolean }>`
  font-size: 16px;
  font-weight: ${({ $isActive }) => ($isActive ? '700' : '400')};
  color: ${({ theme, $isActive }) =>
    $isActive ? theme.colors.primary[40] : theme.colors.grayscale[40]};
  text-decoration: none;

  &:hover {
    color: ${({ theme }) => theme.colors.primary[40]};
  }
`

const MainContent = styled.main`
  flex: 1;
`

const PageHeader = styled(MemberPageTitle)`
  margin: 0 0 24px;

  ${({ theme }) => theme.breakpoint.md} {
    margin-bottom: 32px;
  }
`

const StatsBar = styled.p`
  display: flex;
  align-items: flex-start;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.grayscale[20]};
  margin: 0 0 24px;

  ${({ theme }) => theme.breakpoint.md} {
    margin-bottom: 32px;
  }
`

const StatsIcon = styled(IconFavorite)`
  width: 24px;
  height: 23px;
  flex-shrink: 0;
  margin-right: 8px;
  /* center the 23px icon against the first 24px line box */
  margin-top: 1px;
`

// Wraps the text so it flows/wraps as one flex child beside the icon.
const StatsText = styled.span`
  min-width: 0;
`

type StatsSegmentProps = {
  $isActive?: boolean
}

// Clickable segment inside the stats bar (the total and each section name).
const StatsSegment = styled.button<StatsSegmentProps>`
  display: inline;
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.primary[40]};
  font-weight: ${({ $isActive }) => ($isActive ? '700' : '400')};
  text-decoration: underline;
  transition: color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.primary[20]};
  }
`

const ArticleGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;

  ${({ theme }) => theme.breakpoint.md} {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }

  ${({ theme }) => theme.breakpoint.xl} {
    grid-template-columns: repeat(3, 1fr);
  }
`

const ArticleCard = styled.a`
  display: block;
  min-width: 0;
  text-decoration: none;
  cursor: pointer;

  &:hover h3 {
    color: ${({ theme }) => theme.colors.primary[20]};
  }
`

const ArticleImage = styled.div`
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  margin-bottom: 12px;
  background-color: ${({ theme }) => theme.colors.grayscale[95]};
  border-radius: 2px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

const ArticleDate = styled.time`
  display: block;
  font-size: 14px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.primary[40]};
  margin-bottom: 8px;
`

const ArticleTitle = styled.h3`
  font-weight: 500;
  font-size: 18px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.grayscale[0]};
  margin: 0 0 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.3s ease;
`

const ArticleSummary = styled.p`
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.grayscale[20]};
  margin: 0 0 16px;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const TagList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  list-style: none;
  padding: 0;
  margin: 0;
`

const Tag = styled.li`
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.primary[60]};
  border: 1px solid ${({ theme }) => theme.colors.primary[60]};
  border-radius: 4px;
  padding: 2px 10px;
`

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  color: ${({ theme }) => theme.colors.grayscale[60]};
`

const EmptyMessage = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${({ theme }) => theme.colors.grayscale[60]};
  font-size: 16px;
  line-height: 1.5;
`

const sidebarItems = [
  { label: '個人資料', href: '/member' },
  { label: '電子報', href: '/member/newsletter' },
  { label: '閱讀紀錄', href: '/member/history' },
  { label: '收藏文章', href: '/member/bookmarks' },
  { label: '通知', href: '/member/notifications' },
]

const ITEMS_PER_PAGE = 18

// Helper function to get image URL from favorite post
const getImageUrl = (favorite: FavoriteWithPost): string => {
  const heroImage = favorite.post.heroImage
  const resized = heroImage?.resized
  const resizedWebp = heroImage?.resizedWebp
  return (
    resizedWebp?.w800 ||
    resizedWebp?.w480 ||
    resized?.w800 ||
    resized?.w480 ||
    resized?.original ||
    DEFAULT_POST_IMAGE_PATH
  )
}

const MemberBookmarksPage: NextPageWithLayout = () => {
  const router = useRouter()
  const { firebaseUser, member, loading } = useAuth()

  const [favorites, setFavorites] = useState<FavoriteWithPost[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const isLoadingMoreRef = useRef(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const sentinelRef = useRef<HTMLDivElement>(null)

  // Favorite statistics (total + per-section counts). null = active section
  // filter means "all"; otherwise the selected section id.
  const [stats, setStats] = useState<MemberFavoriteStats | null>(null)
  const [activeSection, setActiveSection] = useState<string | null>(null)

  // postIds of the active section, or undefined when showing all favorites.
  // Used to filter the list request server-side.
  const activePostIds = useMemo(() => {
    if (!activeSection) return undefined
    return stats?.sections.find((s) => s.sectionId === activeSection)?.postIds
  }, [activeSection, stats])

  // Fetch favorite stats when member is available
  const fetchStats = useCallback(async () => {
    if (!member?.id || !firebaseUser?.uid) return
    try {
      const result = await getMemberFavoriteStats(member.id, firebaseUser.uid)
      setStats(result)
    } catch (err) {
      console.error('Failed to fetch favorite stats:', err)
    }
  }, [member?.id, firebaseUser?.uid])

  useEffect(() => {
    if (member?.id) {
      fetchStats()
    }
  }, [member?.id, fetchStats])

  // Fetch favorites when member is available or the section filter changes
  const fetchFavorites = useCallback(async () => {
    if (!member?.id || !firebaseUser?.uid) return

    setInitialLoading(true)
    try {
      const { items, total } = await getMemberFavorites(
        member.id,
        firebaseUser.uid,
        ITEMS_PER_PAGE,
        0,
        activePostIds
      )
      setFavorites(items)
      setHasMore(items.length < total)
    } catch (err) {
      console.error('Failed to fetch favorites:', err)
    } finally {
      setInitialLoading(false)
    }
  }, [member?.id, firebaseUser?.uid, activePostIds])

  useEffect(() => {
    if (member?.id) {
      fetchFavorites()
    }
  }, [member?.id, fetchFavorites])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !firebaseUser) {
      router.push('/auth/login')
    }
  }, [loading, firebaseUser, router])

  const handleLoadMore = useCallback(async () => {
    if (!member?.id || !firebaseUser?.uid || isLoadingMoreRef.current) return

    isLoadingMoreRef.current = true
    setIsLoadingMore(true)
    try {
      const { items: moreFavorites, total } = await getMemberFavorites(
        member.id,
        firebaseUser.uid,
        ITEMS_PER_PAGE,
        favorites.length,
        activePostIds
      )
      setFavorites((prev) => [...prev, ...moreFavorites])
      setHasMore(favorites.length + moreFavorites.length < total)
    } catch (err) {
      console.error('Failed to load more favorites:', err)
    } finally {
      isLoadingMoreRef.current = false
      setIsLoadingMore(false)
    }
  }, [member?.id, firebaseUser?.uid, favorites.length, activePostIds])

  // Infinite scroll: observe sentinel to trigger load more
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore()
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(sentinel)

    return () => observer.disconnect()
  }, [handleLoadMore])

  // Don't render if not authenticated
  if (!loading && !firebaseUser) {
    return null
  }

  const isContentLoading = loading || initialLoading

  return (
    <PageWrapper>
      <ContentWrapper>
        <Sidebar>
          <SidebarList>
            {sidebarItems.map((item) => (
              <SidebarItem
                key={item.href}
                $isActive={item.href === '/member/bookmarks'}
              >
                <Link href={item.href}>{item.label}</Link>
              </SidebarItem>
            ))}
          </SidebarList>
        </Sidebar>

        <MainContent>
          <MobileNav>
            {sidebarItems.map((item) => (
              <MobileNavItem
                key={item.href}
                href={item.href}
                $isActive={item.href === '/member/bookmarks'}
              >
                {item.label}
              </MobileNavItem>
            ))}
          </MobileNav>

          <PageHeader title="收藏文章" clickFrom="member-bookmarks" />

          {stats && stats.total > 0 && (
            <StatsBar>
              <StatsIcon aria-hidden="true" />
              <StatsText>
                你已收藏 {stats.total} 篇文章
                {stats.sections.length > 0 && (
                  <>
                    ，包含{' '}
                    {stats.sections.map((section, idx) => (
                      <span key={section.sectionId}>
                        {idx > 0 && '、'}
                        <StatsSegment
                          type="button"
                          $isActive={activeSection === section.sectionId}
                          onClick={() =>
                            setActiveSection((prev) =>
                              prev === section.sectionId
                                ? null
                                : section.sectionId
                            )
                          }
                        >
                          {section.count} 篇{section.sectionName ?? ''}
                        </StatsSegment>
                      </span>
                    ))}
                  </>
                )}
              </StatsText>
            </StatsBar>
          )}

          {isContentLoading ? (
            <LoadingWrapper>載入中...</LoadingWrapper>
          ) : favorites.length === 0 ? (
            <EmptyMessage>目前沒有收藏文章</EmptyMessage>
          ) : (
            <>
              <ArticleGrid>
                {favorites.map((favorite) => (
                  <ArticleCard
                    key={favorite.id}
                    href={`/node/${favorite.post.id}`}
                  >
                    <ArticleImage>
                      <img
                        src={getImageUrl(favorite)}
                        alt={favorite.post.title}
                      />
                    </ArticleImage>
                    <ArticleDate>
                      {formatPostDate(favorite.post.publishTime)}
                    </ArticleDate>
                    <ArticleTitle>{favorite.post.title}</ArticleTitle>
                    <ArticleSummary>
                      {favorite.post.contentPreview}
                    </ArticleSummary>
                    <TagList>
                      {favorite.post.tags.map((tag) => (
                        <Tag key={tag.id}>{tag.name}</Tag>
                      ))}
                    </TagList>
                  </ArticleCard>
                ))}
              </ArticleGrid>

              {hasMore && (
                <LoadingWrapper ref={sentinelRef}>
                  {isLoadingMore && '載入中...'}
                </LoadingWrapper>
              )}
            </>
          )}
        </MainContent>
      </ContentWrapper>
    </PageWrapper>
  )
}

MemberBookmarksPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <LayoutGeneral title="收藏文章" description="您的收藏文章">
      {page}
    </LayoutGeneral>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  setPrivateCacheControl(res)

  const headerData = await fetchHeaderData()

  return {
    props: {
      headerData,
    },
  }
}

export default MemberBookmarksPage

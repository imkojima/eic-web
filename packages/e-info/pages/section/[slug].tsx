// Section page - switches between default (listing) and column (grid) layouts based on section.style
import errors from '@twreporter/errors'
import type { GetServerSideProps } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import type { ReactElement } from 'react'
import styled from 'styled-components'

import { getGqlClient } from '~/apollo-client'
import LayoutGeneral from '~/components/layout/layout-general'
import ArticleLists from '~/components/shared/article-lists'
import ResponsiveImage from '~/components/shared/responsive-image'
import {
  DEFAULT_NEWS_IMAGE_PATH,
  DEFAULT_POST_IMAGE_PATH,
} from '~/constants/constant'
import {
  MAX_CONTENT_WIDTH,
  POSTS_PER_CATEGORY,
  POSTS_PER_PAGE,
} from '~/constants/layout'
import type { HeaderContextData } from '~/contexts/header-context'
import type {
  CategoryPostForListing,
  SectionForListing,
  SectionListingCategory,
  SectionPageCategory,
  SectionPageData,
  SectionPost,
} from '~/graphql/query/section'
import {
  sectionBySlug,
  sectionPageBySlug,
  sectionPostsForListing,
} from '~/graphql/query/section'
import type { NextPageWithLayout } from '~/pages/_app'
import IconBack from '~/public/icons/arrow_back.svg'
import IconForward from '~/public/icons/arrow_forward.svg'
import type { ArticleCard } from '~/types/component'
import { setCacheControl } from '~/utils/common'
import { fetchHeaderData } from '~/utils/header-data'
import {
  fetchSectionListing,
  isSectionDefaultListing,
} from '~/utils/listing-api'
import {
  formatPostDate,
  mergePostsWithFeatured,
  postConvertFunc,
} from '~/utils/post'

// ========== Shared Styled Components ==========

const PageWrapper = styled.div`
  width: 100%;
`

// ========== Default Style (Listing) Styled Components ==========

const DefaultPageWrapper = styled.div`
  padding: 20px 0 24px;

  ${({ theme }) => theme.breakpoint.md} {
    padding: 20px 0 48px;
  }

  ${({ theme }) => theme.breakpoint.lg} {
    padding: 20px 0 60px;
    max-width: ${MAX_CONTENT_WIDTH};
    margin: auto;
  }

  ${({ theme }) => theme.breakpoint.xl} {
    padding: 40px 0 60px;
  }
`

const DefaultArticleWrapper = styled.div`
  padding: 0 27px;

  ${({ theme }) => theme.breakpoint.md} {
    padding: 0 98px;
  }

  ${({ theme }) => theme.breakpoint.xl} {
    padding: 0 58px;
  }
`

const DefaultHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  justify-content: normal;
  padding: 0 27px;

  @media (min-width: ${({ theme }) => theme.mediaSize.md}px) {
    padding: 0 98px;
  }

  @media (min-width: ${({ theme }) => theme.mediaSize.xl}px) {
    padding: 0 58px;
  }
`

const DefaultAccentBar = styled.div`
  background-color: ${({ theme }) => theme.colors.primary[20]};
  width: 60px;
  height: 20px;
  margin-right: 0.75rem;
  border-bottom-right-radius: 12px;

  @media (min-width: ${({ theme }) => theme.mediaSize.xl}px) {
    width: 80px;
    height: 32px;
  }
`

const DefaultTitle = styled.h1`
  font-size: 18px;
  font-weight: 500;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.grayscale[0]};
  margin: 0;

  @media (min-width: ${({ theme }) => theme.mediaSize.xl}px) {
    font-size: 28px;
    line-height: 32px;
  }
`

const DefaultCategoryTabs = styled.div`
  display: flex;
  row-gap: 8px;
  column-gap: 16px;
  margin-top: 12px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  flex-wrap: nowrap;
  padding: 0 27px;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (min-width: ${({ theme }) => theme.mediaSize.md}px) {
    width: 100%;
    overflow-x: visible;
    flex-wrap: wrap;
    padding: 0 98px;
  }

  @media (min-width: ${({ theme }) => theme.mediaSize.xl}px) {
    width: auto;
    margin-top: 0;
    padding: 0 58px;
  }
`

const DefaultCategoryTab = styled(Link)`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.grayscale[20]};
  font-weight: 700;
  font-size: 20px;
  line-height: 28px;
  cursor: pointer;
  transition: color 0.3s ease;
  white-space: nowrap;
  flex-shrink: 0;
  text-decoration: none;

  &:hover {
    color: ${({ theme }) => theme.colors.primary[20]};
  }
`

const DefaultDivider = styled.hr`
  border: none;
  border-top: 1px solid #000;
  margin: 20px 28px 24px;

  @media (min-width: ${({ theme }) => theme.mediaSize.md}px) {
    margin-top: 24px;
    margin-left: 98px;
    margin-right: 98px;
    margin-bottom: 24px;
  }

  @media (min-width: ${({ theme }) => theme.mediaSize.xl}px) {
    margin-top: 28px;
    margin-left: 58px;
    margin-right: 58px;
    margin-bottom: 28px;
  }
`

const PaginationWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 13px;
  margin-top: 24px;
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

  > svg {
    width: 25px;
    height: 25px;
  }

  @media (min-width: ${({ theme }) => theme.mediaSize.md}px) {
    min-width: 40px;
    height: 40px;

    > svg {
      width: 40px;
      height: 40px;
    }
  }
`

const PaginationButton = styled(Link)<{
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
  text-decoration: none;

  &:hover {
    background: ${({ theme }) => theme.colors.primary[20]};
    border-color: ${({ theme }) => theme.colors.primary[20]};
    color: #fff;
  }

  @media (min-width: ${({ theme }) => theme.mediaSize.md}px) {
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

  @media (min-width: ${({ theme }) => theme.mediaSize.xl}px) {
    min-width: 48px;
    height: 48px;
    font-size: 16px;
  }
`

const EmptyMessage = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: ${({ theme }) => theme.colors.grayscale[40]};
  font-size: 16px;
`

// ========== Column Style (Grid) Styled Components ==========

// Hero Section - maintains 1200:420 (20:7) aspect ratio
const HeroSection = styled.div`
  position: relative;
  width: 100%;
  max-width: ${MAX_CONTENT_WIDTH};
  margin: 0 auto;
  aspect-ratio: 1200 / 420;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

const HeroImageWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.1) 0%,
      rgba(0, 0, 0, 0.4) 100%
    );
  }
`

const HeroTitleWrapper = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
`

const HeroAccentBar = styled.div`
  background-color: ${({ theme }) => theme.colors.primary[80]};
  width: 20px;
  height: 32px;
  margin-right: 0.75rem;
  border-bottom-right-radius: 12px;

  @media (min-width: ${({ theme }) => theme.mediaSize.xl}px) {
    width: 20px;
    height: 32px;
  }
`

const HeroTitle = styled.h1`
  font-size: 28px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.primary[80]};
  margin: 0;

  @media (min-width: ${({ theme }) => theme.mediaSize.md}px) {
    font-size: 32px;
  }
`

// Category Tags Section
const CategoryTagsWrapper = styled.div`
  max-width: ${MAX_CONTENT_WIDTH};
  margin: 0 auto 40px;
  background: linear-gradient(
    180deg,
    rgba(207, 237, 209, 0.6) 61.06%,
    rgba(139, 200, 144, 0.6) 100%
  );
  padding: 16px 20px;

  @media (min-width: ${({ theme }) => theme.mediaSize.md}px) {
    padding: 20px 40px;
  }

  @media (min-width: ${({ theme }) => theme.mediaSize.xl}px) {
    padding: 24px 60px;
  }
`

const CategoryTagsContainer = styled.div`
  max-width: ${MAX_CONTENT_WIDTH};
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  justify-content: center;

  @media (min-width: ${({ theme }) => theme.mediaSize.md}px) {
    gap: 12px 16px;
  }
`

const CategoryTag = styled(Link)`
  display: inline-block;
  padding: 8px;
  border: 1px solid ${({ theme }) => theme.colors.grayscale[40]};
  border-radius: 12px;
  background-color: transparent;
  color: ${({ theme }) => theme.colors.grayscale[40]};
  font-size: 20px;
  font-weight: 700;
  line-height: 28px;
  text-decoration: none;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary[20]};
    border-color: ${({ theme }) => theme.colors.primary[20]};
    color: #fff;
  }
`

const DescriptionSection = styled.div`
  max-width: ${MAX_CONTENT_WIDTH};
  margin: 0 auto 40px;
  padding: 24px 20px;
  font-size: 18px;
  font-weight: 500;
  line-height: 1.5;
  color: #000;

  @media (min-width: ${({ theme }) => theme.mediaSize.md}px) {
    padding: 24px 58px 40px 58px;
  }
`

// Categories Grid Container (2 columns on desktop)
const CategoriesGrid = styled.div`
  max-width: ${MAX_CONTENT_WIDTH};
  margin: 0 auto;
  padding: 0 20px;

  @media (min-width: ${({ theme }) => theme.mediaSize.md}px) {
    padding: 0 40px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0 32px;
  }

  @media (min-width: ${({ theme }) => theme.mediaSize.xl}px) {
    padding: 0 60px;
    gap: 0 48px;
  }
`

// Category Article Section
const CategorySection = styled.section`
  padding-bottom: 32px;

  border-bottom: 1px solid ${({ theme }) => theme.colors.primary[20]};
  margin-bottom: 32px;
`

const CategoryHeader = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding-bottom: 20px;

  @media (min-width: ${({ theme }) => theme.mediaSize.xl}px) {
    justify-content: space-between;
    padding-bottom: 16px;
  }
`

const CategoryName = styled.h2`
  font-size: 20px;
  font-weight: 700;
  line-height: 28px;
  color: ${({ theme }) => theme.colors.primary[20]};
  margin: 0;

  @media (min-width: ${({ theme }) => theme.mediaSize.md}px) {
    font-size: 20px;
    line-height: 28px;
  }

  @media (min-width: ${({ theme }) => theme.mediaSize.xl}px) {
    font-size: 28px;
    line-height: 32px;
  }
`

const ReadMoreLink = styled(Link)`
  display: none;
  font-size: 14px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary[20]};
  text-decoration: underline;

  &:hover {
    color: ${({ theme }) => theme.colors.primary[40]};
  }

  @media (min-width: ${({ theme }) => theme.mediaSize.xl}px) {
    display: block;
    font-size: 16px;
  }
`

// Article List Layout (vertical stack within each category)
const ArticleList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (min-width: ${({ theme }) => theme.mediaSize.md}px) {
    gap: 20px;
  }
`

// Large Card (First article)
const LargeCard = styled.span`
  display: block;
  text-decoration: none;
  cursor: pointer;
`

const LargeCardImageWrapper = styled.div`
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background-color: #e5e5e5;
  margin-bottom: 12px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media (min-width: ${({ theme }) => theme.mediaSize.md}px) {
    aspect-ratio: 4 / 3;
    margin-bottom: 16px;
  }
`

const LargeCardDate = styled.div`
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.primary[20]};
  margin-bottom: 8px;
`

const LargeCardTitle = styled.h3`
  font-size: 18px;
  font-weight: 500;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.grayscale[0]};
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.2s ease;

  ${LargeCard}:hover & {
    color: ${({ theme }) => theme.colors.primary[20]};
  }

  @media (min-width: ${({ theme }) => theme.mediaSize.md}px) {
    font-size: 18px;
    line-height: 1.5;
  }

  @media (min-width: ${({ theme }) => theme.mediaSize.xl}px) {
    font-weight: 700;
    font-size: 20px;
    line-height: 28px;
    min-height: 56px;
  }
`

// Small Card (Secondary articles)
const SmallCard = styled.span`
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-decoration: none;
  cursor: pointer;

  @media (min-width: ${({ theme }) => theme.mediaSize.md}px) {
    flex-direction: row;
    gap: 16px;
  }
`

const SmallCardImageWrapper = styled.div`
  display: none;

  @media (min-width: ${({ theme }) => theme.mediaSize.md}px) {
    display: block;
    width: 160px;
    height: 107px;
    flex-shrink: 0;
    overflow: hidden;
    background-color: #e5e5e5;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  @media (min-width: ${({ theme }) => theme.mediaSize.xl}px) {
    width: 180px;
    height: 120px;
  }
`

const SmallCardContent = styled.div`
  flex: 1;
`

const SmallCardDate = styled.div`
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.primary[20]};
  margin-bottom: 4px;
`

const SmallCardTitle = styled.h4`
  font-size: 18px;
  font-weight: 500;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.grayscale[0]};
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.2s ease;

  ${SmallCard}:hover & {
    color: ${({ theme }) => theme.colors.primary[20]};
  }

  @media (min-width: ${({ theme }) => theme.mediaSize.md}px) {
    font-size: 18px;
  }
`

const MobileReadMoreWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 16px;

  @media (min-width: ${({ theme }) => theme.mediaSize.xl}px) {
    display: none;
  }
`

const MobileReadMoreLink = styled(Link)`
  color: ${({ theme }) => theme.colors.primary[40]};
  font-size: 16px;
  font-weight: 700;
  line-height: 1.5;
  text-decoration: underline;

  &:hover {
    color: ${({ theme }) => theme.colors.primary[20]};
  }
`

// ========== Helper Functions ==========

function generatePaginationItems(
  currentPage: number,
  totalPages: number
): (number | 'ellipsis')[] {
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

// ========== Column Style Components ==========

type CategoryArticleSectionProps = {
  category: SectionPageCategory
}

const CategoryArticleSection = ({ category }: CategoryArticleSectionProps) => {
  // Merge featured posts with regular posts
  const posts = mergePostsWithFeatured<SectionPost>(
    category.featuredPostsInInputOrder || [],
    category.posts || [],
    POSTS_PER_CATEGORY
  )

  if (posts.length === 0) {
    return null
  }

  const largePost = posts[0]
  const smallPosts = posts.slice(1, 3)

  // Use different default image for "編輯直送" category
  const isEditorCategory = category.slug === 'editorpick'
  const defaultImage = isEditorCategory
    ? DEFAULT_NEWS_IMAGE_PATH
    : DEFAULT_POST_IMAGE_PATH

  const getPostDefaultImage = (postStyle: string) =>
    postStyle === 'editor' ? DEFAULT_NEWS_IMAGE_PATH : defaultImage

  return (
    <CategorySection>
      <CategoryHeader>
        <CategoryName>{category.name}</CategoryName>
        <ReadMoreLink href={`/category/${category.id}`}>閱讀更多</ReadMoreLink>
      </CategoryHeader>
      <ArticleList>
        {/* Large Card */}
        <Link href={`/node/${largePost.id}`}>
          <LargeCard>
            <LargeCardImageWrapper>
              <ResponsiveImage
                resized={largePost.heroImage?.resized}
                resizedWebp={largePost.heroImage?.resizedWebp}
                defaultSrc={getPostDefaultImage(largePost.style)}
                alt={largePost.title}
                sizes="(max-width: 767px) 100vw, (max-width: 1199px) 50vw, 540px"
              />
            </LargeCardImageWrapper>
            <LargeCardDate>
              {formatPostDate(largePost.publishTime)}
            </LargeCardDate>
            <LargeCardTitle>{largePost.title}</LargeCardTitle>
          </LargeCard>
        </Link>

        {/* Small Cards */}
        {smallPosts.map((post) => (
          <Link key={post.id} href={`/node/${post.id}`}>
            <SmallCard>
              <SmallCardImageWrapper>
                <ResponsiveImage
                  resized={post.heroImage?.resized}
                  resizedWebp={post.heroImage?.resizedWebp}
                  defaultSrc={getPostDefaultImage(post.style)}
                  alt={post.title}
                  sizes="(max-width: 1199px) 160px, 180px"
                />
              </SmallCardImageWrapper>
              <SmallCardContent>
                <SmallCardDate>
                  {formatPostDate(post.publishTime)}
                </SmallCardDate>
                <SmallCardTitle>{post.title}</SmallCardTitle>
              </SmallCardContent>
            </SmallCard>
          </Link>
        ))}
      </ArticleList>
      <MobileReadMoreWrapper>
        <MobileReadMoreLink href={`/category/${category.id}`}>
          閱讀更多
        </MobileReadMoreLink>
      </MobileReadMoreWrapper>
    </CategorySection>
  )
}

// ========== Page Props Types ==========

type BasePageProps = {
  headerData: HeaderContextData
}

type SectionDefaultPageProps = BasePageProps & {
  pageType: 'default'
  section: SectionForListing
  categories: SectionListingCategory[]
  posts: ArticleCard[]
  totalPosts: number
  currentPage: number
  totalPages: number
}

type SectionColumnPageProps = BasePageProps & {
  pageType: 'column'
  section: SectionPageData
  categories: SectionPageCategory[]
}

type PageProps = SectionDefaultPageProps | SectionColumnPageProps

// ========== Default Style Page Component ==========

const SectionDefaultPage = ({
  section,
  categories,
  posts,
  currentPage,
  totalPages,
}: SectionDefaultPageProps) => {
  const router = useRouter()
  const sectionSlug = router.query.slug as string

  const buildPageUrl = (page: number) => {
    if (page === 1) {
      return `/section/${sectionSlug}`
    }
    return `/section/${sectionSlug}?page=${page}`
  }

  const paginationItems = generatePaginationItems(currentPage, totalPages)

  return (
    <DefaultPageWrapper>
      <DefaultHeader>
        <DefaultAccentBar />
        <DefaultTitle>{section.name}</DefaultTitle>
      </DefaultHeader>
      <DefaultCategoryTabs>
        {categories.map((category) => (
          <DefaultCategoryTab
            key={category.id}
            href={`/category/${category.id}`}
          >
            {category.name}
          </DefaultCategoryTab>
        ))}
      </DefaultCategoryTabs>
      <DefaultDivider />

      <DefaultArticleWrapper>
        {posts.length > 0 ? (
          <ArticleLists posts={posts} AdPageKey={sectionSlug} />
        ) : (
          <EmptyMessage>目前沒有文章</EmptyMessage>
        )}
      </DefaultArticleWrapper>

      {totalPages > 1 && (
        <PaginationWrapper>
          <BackForwardButton
            $isDisabled={currentPage === 1}
            onClick={() => {
              if (currentPage > 1) {
                router.push(buildPageUrl(currentPage - 1))
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
                href={buildPageUrl(item)}
                $isActive={item === currentPage}
                $isLarge={item >= 1000}
              >
                {String(item).padStart(2, '0')}
              </PaginationButton>
            )
          )}

          <BackForwardButton
            $isDisabled={currentPage === totalPages}
            onClick={() => {
              if (currentPage < totalPages) {
                router.push(buildPageUrl(currentPage + 1))
              }
            }}
          >
            <IconForward />
          </BackForwardButton>
        </PaginationWrapper>
      )}
    </DefaultPageWrapper>
  )
}

// ========== Column Style Page Component ==========

const SectionColumnPage = ({ section, categories }: SectionColumnPageProps) => {
  const hasHeroImage = !!section.heroImage?.resized
  // Use columnCategoryTags if available, fallback to categories
  const tagSource =
    section.columnCategoryTags && section.columnCategoryTags.length > 0
      ? section.columnCategoryTags
      : categories
  const categoriesWithPosts = tagSource.filter(
    (cat) =>
      (cat.featuredPostsInInputOrder &&
        cat.featuredPostsInInputOrder.length > 0) ||
      (cat.posts && cat.posts.length > 0)
  )

  return (
    <PageWrapper>
      {/* Hero Section */}
      <HeroSection>
        <HeroImageWrapper>
          {hasHeroImage ? (
            <ResponsiveImage
              resized={section.heroImage?.resized}
              resizedWebp={section.heroImage?.resizedWebp}
              defaultSrc={DEFAULT_POST_IMAGE_PATH}
              alt={section.name}
              priority
              sizes="100vw"
            />
          ) : (
            <img src={DEFAULT_POST_IMAGE_PATH} alt={section.name} />
          )}
        </HeroImageWrapper>
        <HeroTitleWrapper>
          <HeroAccentBar />
          <HeroTitle>{section.name}</HeroTitle>
        </HeroTitleWrapper>
      </HeroSection>

      {/* Category Tags */}
      <CategoryTagsWrapper>
        <CategoryTagsContainer>
          {categoriesWithPosts.map((category) => (
            <CategoryTag key={category.id} href={`/category/${category.id}`}>
              {category.name}
            </CategoryTag>
          ))}
        </CategoryTagsContainer>
      </CategoryTagsWrapper>

      {/* Description Section */}
      {section.description && (
        <DescriptionSection>{section.description}</DescriptionSection>
      )}

      {/* Category Article Sections - 2 columns on desktop */}
      {categoriesWithPosts.length > 0 ? (
        <CategoriesGrid>
          {categoriesWithPosts.map((category) => (
            <CategoryArticleSection key={category.id} category={category} />
          ))}
        </CategoriesGrid>
      ) : (
        <EmptyMessage>目前沒有文章</EmptyMessage>
      )}
    </PageWrapper>
  )
}

// ========== Main Page Component ==========

const SectionPage: NextPageWithLayout<PageProps> = (props) => {
  if (props.pageType === 'default') {
    return <SectionDefaultPage {...props} />
  }
  return <SectionColumnPage {...props} />
}

export const getServerSideProps: GetServerSideProps<PageProps> = async ({
  params,
  query,
  res,
}) => {
  setCacheControl(res)

  const slug = params?.slug as string
  const client = getGqlClient()

  try {
    const page = Math.max(1, parseInt(query.page as string, 10) || 1)

    // 嘗試從 JSON API 取得資料（僅前 5 頁）
    const [headerData, listingData] = await Promise.all([
      fetchHeaderData(),
      fetchSectionListing(slug, page),
    ])

    if (listingData) {
      if (isSectionDefaultListing(listingData)) {
        // Default style: 分頁文章列表
        const posts: ArticleCard[] = listingData.posts.map((post) =>
          postConvertFunc(post as Parameters<typeof postConvertFunc>[0])
        )

        return {
          props: {
            pageType: 'default',
            section: listingData.section,
            categories: listingData.categories,
            posts,
            totalPosts: listingData.totalPosts,
            currentPage: page,
            totalPages: listingData.totalPages,
            headerData,
          },
        }
      } else {
        // Column style: 分類格狀排列
        return {
          props: {
            pageType: 'column',
            section: listingData.section,
            categories: listingData.categories,
            headerData,
          },
        }
      }
    }

    // Fallback: 使用 GraphQL 查詢（第 6 頁起或 JSON API 失敗時）
    const sectionResult = await client.query<{
      sections: SectionForListing[]
    }>({
      query: sectionBySlug,
      variables: { slug },
    })

    if (sectionResult.error || !sectionResult.data?.sections?.length) {
      return { notFound: true }
    }

    const sectionBasic = sectionResult.data.sections[0]
    const isDefaultStyle = sectionBasic.style === 'default'

    if (isDefaultStyle) {
      // Default style: fetch paginated posts list
      const skip = (page - 1) * POSTS_PER_PAGE

      const postsResult = await client.query<{
        posts: CategoryPostForListing[]
        postsCount: number
      }>({
        query: sectionPostsForListing,
        variables: {
          sectionSlug: slug,
          take: POSTS_PER_PAGE,
          skip,
        },
      })

      if (postsResult.error) {
        console.error('Posts query error:', postsResult.error)
        throw new Error('Failed to fetch posts: GraphQL error')
      }

      const totalPosts = postsResult.data?.postsCount ?? 0
      const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE)

      // Convert posts to ArticleCard format
      const posts: ArticleCard[] = (postsResult.data?.posts || []).map((post) =>
        postConvertFunc(post as Parameters<typeof postConvertFunc>[0])
      )

      return {
        props: {
          pageType: 'default',
          section: sectionBasic,
          categories: sectionBasic.categories,
          posts,
          totalPosts,
          currentPage: page,
          totalPages,
          headerData,
        },
      }
    } else {
      // Column style: fetch category grid data
      const result = await client.query<{ sections: SectionPageData[] }>({
        query: sectionPageBySlug,
        variables: {
          slug,
          postsPerCategory: POSTS_PER_CATEGORY,
        },
      })

      if (result.error || !result.data?.sections?.length) {
        return { notFound: true }
      }

      const section = result.data.sections[0]
      const categories = section.categories || []

      return {
        props: {
          pageType: 'column',
          section,
          categories,
          headerData,
        },
      }
    }
  } catch (err) {
    const annotatingError = errors.helpers.wrap(
      err,
      'UnhandledError',
      'Error occurs while fetching data at Section page'
    )

    console.error(
      JSON.stringify({
        severity: 'ERROR',
        message: errors.helpers.printAll(annotatingError, {
          withStack: false,
          withPayload: true,
        }),
      })
    )

    throw new Error('Error occurs while fetching data.')
  }
}

SectionPage.getLayout = function getLayout(page: ReactElement<PageProps>) {
  const { props } = page

  return <LayoutGeneral title={props.section.name}>{page}</LayoutGeneral>
}

export default SectionPage

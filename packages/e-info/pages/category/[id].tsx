// Category listing page - shows posts from specific category
import errors from '@twreporter/errors'
import type { GetServerSideProps } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import type { ReactElement } from 'react'
import styled from 'styled-components'

import { getGqlClient } from '~/apollo-client'
import LayoutGeneral from '~/components/layout/layout-general'
import ArticleLists from '~/components/shared/article-lists'
import Pagination from '~/components/shared/pagination'
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
  ClassifyWithPosts,
  SectionListingCategory,
} from '~/graphql/query/section'
import {
  categoryByIdWithSection,
  categoryColumnPageData,
  categoryPostsForListing,
  classifyPostsForListing,
} from '~/graphql/query/section'
import type { NextPageWithLayout } from '~/pages/_app'
import type { ArticleCard } from '~/types/component'
import { setCacheControl } from '~/utils/common'
import { fetchHeaderData } from '~/utils/header-data'
import { fetchCategoryListing } from '~/utils/listing-api'
import { formatPostDate, postConvertFunc } from '~/utils/post'

const PageWrapper = styled.div`
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

const ArticleWrapper = styled.div`
  padding: 0 27px;

  ${({ theme }) => theme.breakpoint.md} {
    padding: 0 98px;
  }

  ${({ theme }) => theme.breakpoint.xl} {
    padding: 0 58px;
  }
`

const Header = styled.div`
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

const AccentBar = styled.div`
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

const TitleLink = styled(Link)`
  font-size: 18px;
  font-weight: 500;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.grayscale[0]};
  margin: 0;
  text-decoration: none;

  &:hover {
    color: ${({ theme }) => theme.colors.primary[20]};
  }

  @media (min-width: ${({ theme }) => theme.mediaSize.xl}px) {
    font-size: 28px;
    line-height: 32px;
  }
`

const CategoryTabs = styled.div`
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

const CategoryTab = styled(Link)<{ $isActive?: boolean }>`
  background: none;
  border: none;
  color: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.primary[20] : theme.colors.grayscale[20]};
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

const Divider = styled.hr`
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

const EmptyMessage = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: ${({ theme }) => theme.colors.grayscale[40]};
  font-size: 16px;
`

// ========== Column Style Header Styled Components ==========

const ColumnPageWrapper = styled.div<{ $withTopPadding?: boolean }>`
  width: 100%;
  padding-bottom: 24px;

  ${({ $withTopPadding }) =>
    $withTopPadding &&
    `
    padding-top: 20px;
  `}

  ${({ theme }) => theme.breakpoint.md} {
    padding-bottom: 48px;
  }

  ${({ theme }) => theme.breakpoint.lg} {
    padding-bottom: 60px;
  }

  ${({ $withTopPadding, theme }) =>
    $withTopPadding &&
    `
    @media (min-width: ${theme.mediaSize.xl}px) {
      padding-top: 40px;
    }
  `}
`

const ColumnHeroSection = styled.div`
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

const ColumnHeroImageWrapper = styled.div`
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

const ColumnHeroTitleWrapper = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
`

const ColumnHeroAccentBar = styled.div`
  background-color: ${({ theme }) => theme.colors.primary[80]};
  width: 20px;
  height: 32px;
  margin-right: 0.75rem;
  border-bottom-right-radius: 12px;
`

const ColumnHeroTitle = styled.h1`
  font-size: 28px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.primary[80]};
  margin: 0;

  @media (min-width: ${({ theme }) => theme.mediaSize.md}px) {
    font-size: 32px;
  }
`

const ColumnCategoryTagsWrapper = styled.div`
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

const ColumnCategoryTagsContainer = styled.div`
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

const ColumnCategoryTag = styled(Link)<{ $isActive?: boolean }>`
  display: inline-block;
  padding: 8px;
  border: 1px solid
    ${({ $isActive, theme }) =>
      $isActive ? theme.colors.primary[20] : theme.colors.grayscale[40]};
  border-radius: 12px;
  background-color: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.primary[20] : 'transparent'};
  color: ${({ $isActive, theme }) =>
    $isActive ? '#fff' : theme.colors.grayscale[40]};
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

const ColumnDescriptionSection = styled.div`
  max-width: ${MAX_CONTENT_WIDTH};
  margin: 0 auto;
  padding: 24px 20px;
  font-size: 18px;
  font-weight: 500;
  line-height: 1.5;
  color: #000;

  @media (min-width: ${({ theme }) => theme.mediaSize.md}px) {
    padding: 24px 58px 40px 58px;
  }
`

const ColumnContentWrapper = styled.div`
  max-width: ${MAX_CONTENT_WIDTH};
  margin: 0 auto;
  padding: 24px 27px;

  @media (min-width: ${({ theme }) => theme.mediaSize.md}px) {
    padding: 24px 98px;
  }

  @media (min-width: ${({ theme }) => theme.mediaSize.xl}px) {
    padding: 24px 58px;
  }
`

const SectionHeaderWrapper = styled.div<{ $compactBottom?: boolean }>`
  ${({ theme }) => theme.breakpoint.lg} {
    max-width: ${MAX_CONTENT_WIDTH};
    margin: 0 auto;
  }

  ${({ $compactBottom }) =>
    $compactBottom &&
    `
    hr {
      margin-bottom: 16px;
    }
  `}
`

const CategoryColumnContentWrapper = styled.div`
  padding: 0 28px;

  @media (min-width: ${({ theme }) => theme.mediaSize.md}px) {
    padding: 0 98px;
  }

  ${({ theme }) => theme.breakpoint.lg} {
    max-width: ${MAX_CONTENT_WIDTH};
    margin: 0 auto;
  }

  @media (min-width: ${({ theme }) => theme.mediaSize.xl}px) {
    padding: 0 58px;
  }
`

// ========== Category Column Style (Grid) Styled Components ==========

const ClassifiesGrid = styled.div`
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

const ClassifySection = styled.section`
  padding-bottom: 32px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.primary[20]};
  margin-bottom: 32px;
`

const ClassifyHeader = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding-bottom: 20px;

  @media (min-width: ${({ theme }) => theme.mediaSize.xl}px) {
    justify-content: space-between;
    padding-bottom: 16px;
  }
`

const ClassifyReadMoreLink = styled(Link)`
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

const ClassifyMobileReadMoreWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 16px;

  @media (min-width: ${({ theme }) => theme.mediaSize.xl}px) {
    display: none;
  }
`

const ClassifyMobileReadMoreLink = styled(Link)`
  color: ${({ theme }) => theme.colors.primary[40]};
  font-size: 16px;
  font-weight: 700;
  line-height: 1.5;
  text-decoration: underline;

  &:hover {
    color: ${({ theme }) => theme.colors.primary[20]};
  }
`

const ClassifyName = styled.h2`
  font-size: 20px;
  font-weight: 700;
  line-height: 28px;
  color: ${({ theme }) => theme.colors.primary[20]};
  margin: 0;

  @media (min-width: ${({ theme }) => theme.mediaSize.xl}px) {
    font-size: 28px;
    line-height: 32px;
  }
`

const ClassifyArticleList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (min-width: ${({ theme }) => theme.mediaSize.md}px) {
    gap: 20px;
  }
`

const ClassifyLargeCard = styled.span`
  display: block;
  text-decoration: none;
  cursor: pointer;
`

const ClassifyLargeCardImageWrapper = styled.div`
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

const ClassifyLargeCardDate = styled.div`
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.primary[20]};
  margin-bottom: 8px;
`

const ClassifyLargeCardTitle = styled.h3`
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

  ${ClassifyLargeCard}:hover & {
    color: ${({ theme }) => theme.colors.primary[20]};
  }

  @media (min-width: ${({ theme }) => theme.mediaSize.xl}px) {
    font-weight: 700;
    font-size: 20px;
    line-height: 28px;
    min-height: 56px;
  }
`

const ClassifySmallCard = styled.span`
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

const ClassifySmallCardImageWrapper = styled.div`
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

const ClassifySmallCardContent = styled.div`
  flex: 1;
`

const ClassifySmallCardDate = styled.div`
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.primary[20]};
  margin-bottom: 4px;
`

const ClassifySmallCardTitle = styled.h4`
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

  ${ClassifySmallCard}:hover & {
    color: ${({ theme }) => theme.colors.primary[20]};
  }

  @media (min-width: ${({ theme }) => theme.mediaSize.md}px) {
    font-size: 18px;
  }
`

type HeroImage = {
  resized: {
    original?: string
    w480?: string
    w800?: string
    w1200?: string
    w1600?: string
    w2400?: string
  } | null
  resizedWebp: {
    original?: string
    w480?: string
    w800?: string
    w1200?: string
    w1600?: string
    w2400?: string
  } | null
} | null

type CategoryInfo = {
  id: string
  slug: string
  name: string
  description: string | null
  style: string | null
  postsCount: number
  heroImage: HeroImage
}

type SectionInfo = {
  id: string
  slug: string
  name: string
  style: string | null
  description: string | null
  heroImage: HeroImage
  categories: SectionListingCategory[]
}

type BasePageProps = {
  headerData: HeaderContextData
  category: CategoryInfo
  section: SectionInfo
  categories: SectionListingCategory[]
}

type DefaultPageProps = BasePageProps & {
  pageType: 'default' | 'section-column'
  posts: ArticleCard[]
  totalPosts: number
  currentPage: number
  totalPages: number
}

type CategoryColumnPageProps = BasePageProps & {
  pageType: 'category-column'
  classifyTags: ClassifyWithPosts[]
}

type CategoryColumnFilteredPageProps = BasePageProps & {
  pageType: 'category-column-filtered'
  classifyTags: ClassifyWithPosts[]
  activeClassifyId: string
  activeClassifyName: string
  posts: ArticleCard[]
  totalPosts: number
  currentPage: number
  totalPages: number
}

type PageProps =
  | DefaultPageProps
  | CategoryColumnPageProps
  | CategoryColumnFilteredPageProps

// ========== Classify Article Section Component ==========

type ClassifyArticleSectionProps = {
  classify: ClassifyWithPosts
  defaultImage: string
  categoryId: string
}

const ClassifyArticleSectionComponent = ({
  classify,
  defaultImage,
  categoryId,
}: ClassifyArticleSectionProps) => {
  const posts = (classify.posts || []).slice(0, POSTS_PER_CATEGORY)

  if (posts.length === 0) {
    return null
  }

  const getPostDefaultImage = (postStyle: string) =>
    postStyle === 'editor' ? DEFAULT_NEWS_IMAGE_PATH : defaultImage

  const largePost = posts[0]
  const smallPosts = posts.slice(1, 3)

  return (
    <ClassifySection>
      <ClassifyHeader>
        <ClassifyName>{classify.name}</ClassifyName>
        <ClassifyReadMoreLink
          href={`/category/${categoryId}?classify=${classify.id}`}
        >
          閱讀更多
        </ClassifyReadMoreLink>
      </ClassifyHeader>
      <ClassifyArticleList>
        {/* Large Card */}
        <Link href={`/node/${largePost.id}`}>
          <ClassifyLargeCard>
            <ClassifyLargeCardImageWrapper>
              <ResponsiveImage
                resized={largePost.heroImage?.resized}
                resizedWebp={largePost.heroImage?.resizedWebp}
                defaultSrc={getPostDefaultImage(largePost.style)}
                alt={largePost.title}
                sizes="(max-width: 767px) 100vw, (max-width: 1199px) 50vw, 540px"
              />
            </ClassifyLargeCardImageWrapper>
            <ClassifyLargeCardDate>
              {formatPostDate(largePost.publishTime)}
            </ClassifyLargeCardDate>
            <ClassifyLargeCardTitle>{largePost.title}</ClassifyLargeCardTitle>
          </ClassifyLargeCard>
        </Link>

        {/* Small Cards */}
        {smallPosts.map((post) => (
          <Link key={post.id} href={`/node/${post.id}`}>
            <ClassifySmallCard>
              <ClassifySmallCardImageWrapper>
                <ResponsiveImage
                  resized={post.heroImage?.resized}
                  resizedWebp={post.heroImage?.resizedWebp}
                  defaultSrc={getPostDefaultImage(post.style)}
                  alt={post.title}
                  sizes="(max-width: 1199px) 160px, 180px"
                />
              </ClassifySmallCardImageWrapper>
              <ClassifySmallCardContent>
                <ClassifySmallCardDate>
                  {formatPostDate(post.publishTime)}
                </ClassifySmallCardDate>
                <ClassifySmallCardTitle>{post.title}</ClassifySmallCardTitle>
              </ClassifySmallCardContent>
            </ClassifySmallCard>
          </Link>
        ))}
      </ClassifyArticleList>
      <ClassifyMobileReadMoreWrapper>
        <ClassifyMobileReadMoreLink
          href={`/category/${categoryId}?classify=${classify.id}`}
        >
          閱讀更多
        </ClassifyMobileReadMoreLink>
      </ClassifyMobileReadMoreWrapper>
    </ClassifySection>
  )
}

// ========== Section Header + Category Tabs (shared across all modes) ==========

type SectionHeaderProps = {
  section: SectionInfo
  categories: SectionListingCategory[]
  activeCategoryId: string
  isColumnStyle: boolean
  compactBottom?: boolean
}

const SectionHeaderWithTabs = ({
  section,
  categories,
  activeCategoryId,
  isColumnStyle,
  compactBottom,
}: SectionHeaderProps) => {
  if (isColumnStyle) {
    return (
      <>
        <ColumnHeroSection>
          <ColumnHeroImageWrapper>
            {section.heroImage?.resized ? (
              <ResponsiveImage
                resized={section.heroImage.resized}
                resizedWebp={section.heroImage.resizedWebp}
                defaultSrc={DEFAULT_POST_IMAGE_PATH}
                alt={section.name}
                priority
                sizes="100vw"
              />
            ) : (
              <img src={DEFAULT_POST_IMAGE_PATH} alt={section.name} />
            )}
          </ColumnHeroImageWrapper>
          <ColumnHeroTitleWrapper>
            <ColumnHeroAccentBar />
            <ColumnHeroTitle>{section.name}</ColumnHeroTitle>
          </ColumnHeroTitleWrapper>
        </ColumnHeroSection>
        <ColumnCategoryTagsWrapper>
          <ColumnCategoryTagsContainer>
            {categories.map((cat) => (
              <ColumnCategoryTag
                key={cat.id}
                href={`/category/${cat.id}`}
                $isActive={cat.id === activeCategoryId}
              >
                {cat.name}
              </ColumnCategoryTag>
            ))}
          </ColumnCategoryTagsContainer>
        </ColumnCategoryTagsWrapper>
      </>
    )
  }

  return (
    <SectionHeaderWrapper $compactBottom={compactBottom}>
      <Header>
        <AccentBar />
        <TitleLink href={`/section/${section.slug}`}>{section.name}</TitleLink>
      </Header>
      <CategoryTabs>
        {categories.map((cat) => (
          <CategoryTab
            key={cat.id}
            href={`/category/${cat.id}`}
            $isActive={cat.id === activeCategoryId}
          >
            {cat.name}
          </CategoryTab>
        ))}
      </CategoryTabs>
      <Divider />
    </SectionHeaderWrapper>
  )
}

// ========== Main Page Component ==========

const CategoryPage: NextPageWithLayout<PageProps> = (props) => {
  const { category, section, categories } = props
  const router = useRouter()
  const categoryId = router.query.id as string
  const isSectionColumnStyle =
    section.style !== 'default' && section.style !== null

  const buildPageUrl = (page: number) => {
    if (page === 1) {
      return `/category/${categoryId}`
    }
    return `/category/${categoryId}?page=${page}`
  }

  const defaultImage =
    category.slug === 'editorpick'
      ? DEFAULT_NEWS_IMAGE_PATH
      : DEFAULT_POST_IMAGE_PATH

  // Category column filtered: classify tag selected → list view
  if (props.pageType === 'category-column-filtered') {
    const classifiesWithPosts = props.classifyTags.filter(
      (c) => c.posts && c.posts.length > 0
    )

    const buildFilteredPageUrl = (page: number) => {
      const base = `/category/${categoryId}?classify=${props.activeClassifyId}`
      if (page === 1) return base
      return `${base}&page=${page}`
    }

    return (
      <ColumnPageWrapper $withTopPadding>
        {/* Section header + category tabs */}
        <SectionHeaderWithTabs
          section={section}
          categories={categories}
          activeCategoryId={category.id}
          isColumnStyle={isSectionColumnStyle}
          compactBottom
        />

        <CategoryColumnContentWrapper>
          {/* Category's own hero image */}
          <ColumnHeroSection>
            <ColumnHeroImageWrapper>
              {category.heroImage?.resized ? (
                <ResponsiveImage
                  resized={category.heroImage.resized}
                  resizedWebp={category.heroImage.resizedWebp}
                  defaultSrc={DEFAULT_POST_IMAGE_PATH}
                  alt={category.name}
                  priority
                  sizes="100vw"
                />
              ) : (
                <img src={DEFAULT_POST_IMAGE_PATH} alt={category.name} />
              )}
            </ColumnHeroImageWrapper>
            <ColumnHeroTitleWrapper>
              <ColumnHeroAccentBar />
              <ColumnHeroTitle>{category.name}</ColumnHeroTitle>
            </ColumnHeroTitleWrapper>
          </ColumnHeroSection>

          {/* Classify tags — link back to grid or filter */}
          {classifiesWithPosts.length > 0 && (
            <ColumnCategoryTagsWrapper>
              <ColumnCategoryTagsContainer>
                {classifiesWithPosts.map((c) => (
                  <ColumnCategoryTag
                    key={c.id}
                    href={`/category/${categoryId}?classify=${c.id}`}
                    $isActive={c.id === props.activeClassifyId}
                  >
                    {c.name}
                  </ColumnCategoryTag>
                ))}
              </ColumnCategoryTagsContainer>
            </ColumnCategoryTagsWrapper>
          )}
        </CategoryColumnContentWrapper>

        {/* Article list view */}
        <ColumnContentWrapper>
          {props.posts.length > 0 ? (
            <ArticleLists
              posts={props.posts}
              AdPageKey={category.slug}
              defaultImage={defaultImage}
            />
          ) : (
            <EmptyMessage>目前沒有文章</EmptyMessage>
          )}
        </ColumnContentWrapper>

        <Pagination
          currentPage={props.currentPage}
          totalPages={props.totalPages}
          buildPageUrl={buildFilteredPageUrl}
        />
      </ColumnPageWrapper>
    )
  }

  // Category column style: category's own hero + classify tags grid
  if (props.pageType === 'category-column') {
    const classifiesWithPosts = props.classifyTags.filter(
      (c) => c.posts && c.posts.length > 0
    )

    return (
      <ColumnPageWrapper $withTopPadding>
        {/* Section header + category tabs */}
        <SectionHeaderWithTabs
          section={section}
          categories={categories}
          activeCategoryId={category.id}
          isColumnStyle={isSectionColumnStyle}
          compactBottom
        />

        <CategoryColumnContentWrapper>
          {/* Category's own hero image */}
          <ColumnHeroSection>
            <ColumnHeroImageWrapper>
              {category.heroImage?.resized ? (
                <ResponsiveImage
                  resized={category.heroImage.resized}
                  resizedWebp={category.heroImage.resizedWebp}
                  defaultSrc={DEFAULT_POST_IMAGE_PATH}
                  alt={category.name}
                  priority
                  sizes="100vw"
                />
              ) : (
                <img src={DEFAULT_POST_IMAGE_PATH} alt={category.name} />
              )}
            </ColumnHeroImageWrapper>
            <ColumnHeroTitleWrapper>
              <ColumnHeroAccentBar />
              <ColumnHeroTitle>{category.name}</ColumnHeroTitle>
            </ColumnHeroTitleWrapper>
          </ColumnHeroSection>

          {/* Classify tags */}
          {classifiesWithPosts.length > 0 && (
            <ColumnCategoryTagsWrapper>
              <ColumnCategoryTagsContainer>
                {classifiesWithPosts.map((c) => (
                  <ColumnCategoryTag
                    key={c.id}
                    href={`/category/${categoryId}?classify=${c.id}`}
                    $isActive={false}
                  >
                    {c.name}
                  </ColumnCategoryTag>
                ))}
              </ColumnCategoryTagsContainer>
            </ColumnCategoryTagsWrapper>
          )}

          {/* Description */}
          {category.description && (
            <ColumnDescriptionSection>
              {category.description}
            </ColumnDescriptionSection>
          )}

          {/* Classify Article Sections - 2 columns on desktop */}
          {classifiesWithPosts.length > 0 ? (
            <ClassifiesGrid>
              {classifiesWithPosts.map((classify) => (
                <ClassifyArticleSectionComponent
                  key={classify.id}
                  classify={classify}
                  defaultImage={defaultImage}
                  categoryId={categoryId}
                />
              ))}
            </ClassifiesGrid>
          ) : (
            <EmptyMessage>目前沒有文章</EmptyMessage>
          )}
        </CategoryColumnContentWrapper>
      </ColumnPageWrapper>
    )
  }

  // Section column style: section hero + category tags + paginated articles
  if (props.pageType === 'section-column') {
    return (
      <ColumnPageWrapper>
        <SectionHeaderWithTabs
          section={section}
          categories={categories}
          activeCategoryId={category.id}
          isColumnStyle={true}
        />

        {/* Description: category description takes priority over section description */}
        {(category.description || section.description) && (
          <ColumnDescriptionSection>
            {category.description || section.description}
          </ColumnDescriptionSection>
        )}

        {/* Article Content */}
        <ColumnContentWrapper>
          {props.posts.length > 0 ? (
            <ArticleLists
              posts={props.posts}
              AdPageKey={category.slug}
              defaultImage={defaultImage}
            />
          ) : (
            <EmptyMessage>目前沒有文章</EmptyMessage>
          )}
        </ColumnContentWrapper>

        <Pagination
          currentPage={props.currentPage}
          totalPages={props.totalPages}
          buildPageUrl={buildPageUrl}
        />
      </ColumnPageWrapper>
    )
  }

  // Default style
  return (
    <PageWrapper>
      <SectionHeaderWithTabs
        section={section}
        categories={categories}
        activeCategoryId={category.id}
        isColumnStyle={false}
      />

      <ArticleWrapper>
        {props.posts.length > 0 ? (
          <ArticleLists
            posts={props.posts}
            AdPageKey={category.slug}
            defaultImage={defaultImage}
          />
        ) : (
          <EmptyMessage>目前沒有文章</EmptyMessage>
        )}
      </ArticleWrapper>

      <Pagination
        currentPage={props.currentPage}
        totalPages={props.totalPages}
        buildPageUrl={buildPageUrl}
      />
    </PageWrapper>
  )
}

// Helper to determine page type
function determinePageType(
  categoryStyle: string | null,
  sectionStyle: string | null
): 'default' | 'section-column' | 'category-column' {
  const isCategoryColumn = categoryStyle !== null && categoryStyle !== 'default'
  if (isCategoryColumn) return 'category-column'

  const isSectionColumn = sectionStyle !== null && sectionStyle !== 'default'
  if (isSectionColumn) return 'section-column'

  return 'default'
}

export const getServerSideProps: GetServerSideProps<PageProps> = async ({
  params,
  query,
  res,
}) => {
  setCacheControl(res)

  const categoryId = params?.id as string
  const page = Math.max(1, parseInt(query.page as string, 10) || 1)
  const classifyId = (query.classify as string) || null
  const client = getGqlClient()

  try {
    const [headerData, listingData] = await Promise.all([
      fetchHeaderData(),
      fetchCategoryListing(categoryId, page),
    ])

    // Hidden categories check
    const HIDDEN_CATEGORY_SLUGS = ['homepagegraph', 'breakingnews', 'hottopic']

    if (listingData) {
      if (HIDDEN_CATEGORY_SLUGS.includes(listingData.category.slug)) {
        return { notFound: true }
      }

      const categoryStyle = (listingData.category as CategoryInfo).style ?? null
      const sectionStyle = listingData.section.style ?? null
      const pageType = determinePageType(categoryStyle, sectionStyle)

      const sectionProps: SectionInfo = {
        id: listingData.section.id,
        slug: listingData.section.slug,
        name: listingData.section.name,
        style: listingData.section.style,
        description: listingData.section.description || null,
        heroImage: listingData.section.heroImage || null,
        categories: listingData.section.categories,
      }

      const categoryProps: CategoryInfo = {
        id: listingData.category.id,
        slug: listingData.category.slug,
        name: listingData.category.name,
        description: listingData.category.description || null,
        style: categoryStyle,
        postsCount: listingData.category.postsCount,
        heroImage: (listingData.category as CategoryInfo).heroImage || null,
      }

      // Category column style: fetch classify tags with posts via GraphQL
      if (pageType === 'category-column') {
        const { data: columnData } = await client.query<{
          categories: Array<{
            id: string
            columnClassifyTags: ClassifyWithPosts[]
          }>
        }>({
          query: categoryColumnPageData,
          variables: {
            categoryId,
            postsPerClassify: POSTS_PER_CATEGORY,
          },
        })

        const classifyTags =
          columnData?.categories?.[0]?.columnClassifyTags || []

        // Filtered by classify tag: show list view
        if (classifyId) {
          const skip = (page - 1) * POSTS_PER_PAGE
          const { data: classifyData } = await client.query<{
            classifies: Array<{
              id: string
              name: string
              postsCount: number
              posts: CategoryPostForListing[]
            }>
          }>({
            query: classifyPostsForListing,
            variables: {
              classifyId,
              take: POSTS_PER_PAGE,
              skip,
            },
          })

          const classifyInfo = classifyData?.classifies?.[0]
          if (!classifyInfo) {
            return { notFound: true }
          }

          const totalPosts = classifyInfo.postsCount
          const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE)
          const posts: ArticleCard[] = classifyInfo.posts.map((post) =>
            postConvertFunc(post as Parameters<typeof postConvertFunc>[0])
          )

          return {
            props: {
              pageType: 'category-column-filtered',
              headerData,
              category: categoryProps,
              section: sectionProps,
              categories: listingData.section.categories,
              classifyTags,
              activeClassifyId: classifyId,
              activeClassifyName: classifyInfo.name,
              posts,
              totalPosts,
              currentPage: page,
              totalPages,
            },
          }
        }

        return {
          props: {
            pageType: 'category-column',
            headerData,
            category: categoryProps,
            section: sectionProps,
            categories: listingData.section.categories,
            classifyTags,
          },
        }
      }

      // Default or section-column: paginated posts
      const posts: ArticleCard[] = listingData.posts.map((post) =>
        postConvertFunc(post as Parameters<typeof postConvertFunc>[0])
      )

      return {
        props: {
          pageType,
          headerData,
          category: categoryProps,
          section: sectionProps,
          categories: listingData.section.categories,
          posts,
          totalPosts: listingData.totalPosts,
          currentPage: page,
          totalPages: listingData.totalPages,
        },
      }
    }

    // Fallback: 使用 GraphQL 查詢（第 6 頁起或 JSON API 失敗時）
    const { data: categoryData, error: categoryError } = await client.query<{
      categories: Array<{
        id: string
        slug: string
        name: string
        description: string | null
        style: string | null
        postsCount: number
        heroImage: HeroImage
        section: SectionInfo
      }>
    }>({
      query: categoryByIdWithSection,
      variables: { categoryId },
    })

    if (categoryError || !categoryData?.categories?.length) {
      return { notFound: true }
    }

    const categoryInfo = categoryData.categories[0]

    if (HIDDEN_CATEGORY_SLUGS.includes(categoryInfo.slug)) {
      return { notFound: true }
    }

    const section = categoryInfo.section

    if (!section) {
      return { notFound: true }
    }

    const categories = section.categories
    const pageType = determinePageType(categoryInfo.style, section.style)

    const categoryProps: CategoryInfo = {
      id: categoryInfo.id,
      slug: categoryInfo.slug,
      name: categoryInfo.name,
      description: categoryInfo.description || null,
      style: categoryInfo.style,
      postsCount: categoryInfo.postsCount,
      heroImage: categoryInfo.heroImage || null,
    }

    const sectionProps: SectionInfo = {
      id: section.id,
      slug: section.slug,
      name: section.name,
      style: section.style,
      description: section.description || null,
      heroImage: section.heroImage || null,
      categories: section.categories,
    }

    // Category column style: fetch classify tags with posts
    if (pageType === 'category-column') {
      const { data: columnData } = await client.query<{
        categories: Array<{
          id: string
          columnClassifyTags: ClassifyWithPosts[]
        }>
      }>({
        query: categoryColumnPageData,
        variables: {
          categoryId,
          postsPerClassify: POSTS_PER_CATEGORY,
        },
      })

      const classifyTags = columnData?.categories?.[0]?.columnClassifyTags || []

      // Filtered by classify tag: show list view
      if (classifyId) {
        const skip = (page - 1) * POSTS_PER_PAGE
        const { data: classifyData } = await client.query<{
          classifies: Array<{
            id: string
            name: string
            postsCount: number
            posts: CategoryPostForListing[]
          }>
        }>({
          query: classifyPostsForListing,
          variables: {
            classifyId,
            take: POSTS_PER_PAGE,
            skip,
          },
        })

        const classifyInfo = classifyData?.classifies?.[0]
        if (!classifyInfo) {
          return { notFound: true }
        }

        const totalPosts = classifyInfo.postsCount
        const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE)
        const posts: ArticleCard[] = classifyInfo.posts.map((post) =>
          postConvertFunc(post as Parameters<typeof postConvertFunc>[0])
        )

        return {
          props: {
            pageType: 'category-column-filtered',
            headerData,
            category: categoryProps,
            section: sectionProps,
            categories,
            classifyTags,
            activeClassifyId: classifyId,
            activeClassifyName: classifyInfo.name,
            posts,
            totalPosts,
            currentPage: page,
            totalPages,
          },
        }
      }

      return {
        props: {
          pageType: 'category-column',
          headerData,
          category: categoryProps,
          section: sectionProps,
          categories,
          classifyTags,
        },
      }
    }

    // Default or section-column: fetch paginated posts
    const skip = (page - 1) * POSTS_PER_PAGE

    const { data: postsData, error: postsError } = await client.query<{
      categories: Array<{
        id: string
        postsCount: number
        posts: CategoryPostForListing[]
      }>
    }>({
      query: categoryPostsForListing,
      variables: {
        categoryId,
        take: POSTS_PER_PAGE,
        skip,
      },
    })

    if (postsError || !postsData?.categories?.length) {
      throw new Error('Failed to fetch posts')
    }

    const postsCategory = postsData.categories[0]
    const totalPosts = postsCategory.postsCount
    const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE)

    const posts: ArticleCard[] = postsCategory.posts.map((post) =>
      postConvertFunc(post as Parameters<typeof postConvertFunc>[0])
    )

    return {
      props: {
        pageType,
        headerData,
        category: categoryProps,
        section: sectionProps,
        categories,
        posts,
        totalPosts,
        currentPage: page,
        totalPages,
      },
    }
  } catch (err) {
    const annotatingError = errors.helpers.wrap(
      err,
      'UnhandledError',
      'Error occurs while fetching data at Category page'
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

CategoryPage.getLayout = function getLayout(
  page: ReactElement<
    DefaultPageProps | CategoryColumnPageProps | CategoryColumnFilteredPageProps
  >
) {
  const { props } = page

  return (
    <LayoutGeneral title={`${props.category.name} - ${props.section.name}`}>
      {page}
    </LayoutGeneral>
  )
}

export default CategoryPage

import Link from 'next/link'
import React, { useState } from 'react'
import styled from 'styled-components'

import ResponsiveImage from '~/components/shared/responsive-image'
import {
  DEFAULT_NEWS_IMAGE_PATH,
  DEFAULT_POST_IMAGE_PATH,
} from '~/constants/constant'
import { MAX_CONTENT_WIDTH } from '~/constants/layout'
import type { SectionInfo } from '~/utils/homepage-api'
import { mergePostsWithFeatured } from '~/utils/post'

// Styled Components
const Container = styled.div`
  max-width: ${MAX_CONTENT_WIDTH};
  margin: 0 auto;
  padding: 36px 0;

  // Tablet
  @media (min-width: ${({ theme }) => theme.mediaSize.md}px) {
    padding: 40px 0;
  }

  // Desktop
  @media (min-width: ${({ theme }) => theme.mediaSize.xl}px) {
    padding: 66px 0 0;
  }
`

const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  justify-content: center;

  // Tablet
  @media (min-width: ${({ theme }) => theme.mediaSize.md}px) {
    padding-left: 0;
  }

  // Desktop
  @media (min-width: ${({ theme }) => theme.mediaSize.xl}px) {
    padding-left: 78px;
    justify-content: normal;
  }
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

const TitleButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  font-family: inherit;
  font-size: 18px;
  font-weight: 500;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.grayscale[0]};
  margin: 0;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }

  // Desktop
  @media (min-width: ${({ theme }) => theme.mediaSize.xl}px) {
    font-size: 28px;
    line-height: 32px;
  }
`

const CategoryTabs = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-top: 12px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  flex-wrap: nowrap;

  &::-webkit-scrollbar {
    display: none;
  }

  // Tablet
  @media (min-width: ${({ theme }) => theme.mediaSize.md}px) {
    width: 100%;
    justify-content: center;
    overflow-x: visible;
    flex-wrap: nowrap;
  }

  // Desktop
  @media (min-width: ${({ theme }) => theme.mediaSize.xl}px) {
    width: auto;
    margin-top: 0;
    margin-left: 28px;
  }
`

const CategoryTab = styled.button<{ $isActive?: boolean }>`
  background: none;
  border: none;
  color: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.primary[20] : theme.colors.grayscale[20]};
  font-weight: 700;
  font-size: 20px;
  line-height: 28px;
  cursor: pointer;
  padding: 0.25rem 0;
  transition: color 0.3s ease;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    color: ${({ theme }) => theme.colors.primary[20]};
  }
`

const MainContent = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 30px;

  padding: 0 24px;

  // Tablet
  @media (min-width: ${({ theme }) => theme.mediaSize.md}px) {
    grid-template-columns: 1fr 2fr;
    // grid-template-rows: 1fr 1fr;
    grid-template-areas:
      'A B'
      'A C';
  }

  // Desktop
  @media (min-width: ${({ theme }) => theme.mediaSize.xl}px) {
    padding: 0 60px;
  }
`

const Sidebar = styled.div`
  order: 2;

  // Tablet
  @media (min-width: ${({ theme }) => theme.mediaSize.md}px) {
    grid-area: A;
    border-right: 1px solid #000;
    padding-right: 30px;
  }
`

const NewsItem = styled.a`
  display: block;
  text-decoration: none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grayscale[80]};
  padding-bottom: 1rem;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
`

const NewsDate = styled.div`
  color: ${({ theme }) => theme.colors.primary[20]};
  font-size: 16px;
  font-weight: 700;
  line-height: 1.5;
  margin-bottom: 8px;
`

const NewsTitle = styled.h3`
  color: ${({ theme }) => theme.colors.grayscale[0]};
  font-size: 18px;
  font-weight: 500;
  line-height: 1.5;
  margin: 0;
  transition: color 0.3s ease;

  ${NewsItem}:hover & {
    color: ${({ theme }) => theme.colors.primary[20]};
  }
`

const NewsBrief = styled.p`
  color: ${({ theme }) => theme.colors.grayscale[40]};
  font-family: sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
  margin: 24px 0 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`

const FeaturedImageWrapper = styled.div`
  position: relative;
  margin-bottom: 16px;
  overflow: hidden;
  aspect-ratio: 4 / 3;
  background-color: #d1d5db;

  // Desktop
  @media (min-width: ${({ theme }) => theme.mediaSize.xl}px) {
    aspect-ratio: unset;
    width: 740px;
    height: 555px;
  }
`

const FeaturedArticle = styled.a`
  display: block;
  text-decoration: none;
  order: 1;
  cursor: pointer;

  border-bottom: 1px solid ${({ theme }) => theme.colors.grayscale[80]};
  padding-bottom: 20px;

  // Tablet
  @media (min-width: ${({ theme }) => theme.mediaSize.md}px) {
    grid-area: B;
    border-bottom: none;
    padding-bottom: 0px;
  }

  // Desktop
  @media (min-width: ${({ theme }) => theme.mediaSize.xl}px) {
    grid-area: B;
    border-bottom: 1px solid #000;
    padding-bottom: 30px;
  }
`

const FeaturedContent = styled.div`
  margin-bottom: 0;
`

const FeaturedDate = styled.div`
  color: ${({ theme }) => theme.colors.primary[20]};
  font-size: 16;
  font-weight: 700;
  line-height: 1.5;
  margin-bottom: 0.75rem;
`

const FeaturedTitle = styled.h2`
  color: ${({ theme }) => theme.colors.grayscale[0]};
  font-size: 18px;
  font-weight: 700;
  line-height: 1.5;
  margin: 0;
  margin-bottom: 12px;

  @media (min-width: ${({ theme }) => theme.mediaSize.md}px) {
    font-size: 20px;
    line-height: 28px;
  }

  // Desktop
  @media (min-width: ${({ theme }) => theme.mediaSize.xl}px) {
    font-size: 28px;
    line-height: 32px;
  }

  ${FeaturedArticle}:hover & {
    color: ${({ theme }) => theme.colors.primary[20]};
  }
`

const FeaturedBrief = styled.p`
  color: ${({ theme }) => theme.colors.grayscale[40]};
  font-family: sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;

  @media (min-width: ${({ theme }) => theme.mediaSize.md}px) {
    font-size: 18px;
  }
`

const RelatedArticles = styled.div`
  order: 3;
  display: grid;
  grid-template-columns: 1fr;
  gap: 40px;

  // Tablet
  @media (min-width: ${({ theme }) => theme.mediaSize.md}px) {
    grid-area: C;
    grid-template-columns: repeat(2, 1fr);
  }

  // Desktop
  @media (min-width: ${({ theme }) => theme.mediaSize.xl}px) {
    gap: 60px;
  }
`

const RelatedArticle = styled.a`
  display: flex;
  flex-direction: column;
  gap: 16px;
  text-decoration: none;
  cursor: pointer;
  transition: transform 0.3s ease;

  // Tablet
  @media (min-width: ${({ theme }) => theme.mediaSize.md}px) {
    width: auto;
    min-width: auto;
  }

  // Desktop
  @media (min-width: ${({ theme }) => theme.mediaSize.xl}px) {
    flex-direction: row;
    flex-shrink: 1;
    width: auto;
    min-wdith: 280px;
  }
`

const RelatedImageWrapper = styled.div`
  width: 100%;
  aspect-ratio: 4 / 3;
  background-color: #d1d5db;
  overflow: hidden;

  // Desktop
  @media (min-width: ${({ theme }) => theme.mediaSize.xl}px) {
    width: 144px;
    height: 108px;
    flex-shrink: 0;
  }
`

const RelatedContent = styled.div`
  display: flex;
  flex-direction: column;
`

const RelatedDate = styled.div`
  color: ${({ theme }) => theme.colors.primary[20]};
  font-size: 16px;
  font-weight: 700;
  line-height: 1.5;
  margin-bottom: 4px;
`

const RelatedTitle = styled.h4`
  flex: 1;
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.grayscale[0]};
  line-height: 1.5;
  margin: 0;
  transition: color 0.3s ease;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;

  ${RelatedArticle}:hover & {
    color: ${({ theme }) => theme.colors.primary[20]};
  }

  // Desktop
  @media (min-width: ${({ theme }) => theme.mediaSize.md}px) {
    font-size: 18px;
  }
`

const EmptyMessage = styled.p`
  text-align: center;
  color: #666;
  padding: 2rem;
  grid-column: 1 / -1;
`

// Helper function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}/${month}/${day}`
}

type NewsSectionProps = {
  section?: SectionInfo
}

const MAX_CATEGORY_TABS = 4

const NewsSection = ({ section }: NewsSectionProps) => {
  const categories = section?.categories || []
  const sectionName = section?.name || '時事新聞'

  // Filter categories that have posts (either featured or regular), limit to 4
  const categoriesWithPosts = categories
    .filter(
      (cat) =>
        (cat.featuredPostsInInputOrder &&
          cat.featuredPostsInInputOrder.length > 0) ||
        (cat.posts && cat.posts.length > 0)
    )
    .slice(0, MAX_CATEGORY_TABS)

  const [activeCategory, setActiveCategory] = useState<string>('')

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId)
  }

  const sectionPosts = section?.posts || []

  // If no section posts and no categories with posts, don't render
  if (sectionPosts.length === 0 && categoriesWithPosts.length === 0) {
    return null
  }

  // When no tab is selected (activeCategory === ''), show section-level posts
  // When a tab is selected, show that category's posts
  const currentCategory =
    activeCategory !== ''
      ? categoriesWithPosts.find((cat) => cat.id === activeCategory)
      : null
  const currentPosts =
    activeCategory === ''
      ? sectionPosts.slice(0, 8)
      : mergePostsWithFeatured(
          currentCategory?.featuredPostsInInputOrder || [],
          currentCategory?.posts || [],
          8
        )

  // Featured post is the first one, related gets posts 2-3, sidebar gets posts 4+
  const featuredPost = currentPosts[0]
  const relatedPosts = currentPosts.slice(1, 3)
  const sidebarPosts = currentPosts.slice(3, 8)

  // Use different default image for "編輯直送" category tab, editor style, or editorpick category posts
  const isEditorCategory = currentCategory?.slug === 'editorpick'
  const getDefaultImage = (post: {
    style?: string
    categories?: { slug: string }[]
  }) =>
    isEditorCategory ||
    post.style === 'editor' ||
    post.categories?.some((c) => c.slug === 'editorpick')
      ? DEFAULT_NEWS_IMAGE_PATH
      : DEFAULT_POST_IMAGE_PATH

  return (
    <Container>
      {/* Header */}
      <Header>
        <AccentBar />
        <TitleButton onClick={() => setActiveCategory('')}>
          {sectionName}
        </TitleButton>
        <CategoryTabs>
          {categoriesWithPosts.map((category) => (
            <CategoryTab
              key={category.id}
              $isActive={activeCategory === category.id}
              onClick={() => handleCategoryClick(category.id)}
            >
              {category.name}
            </CategoryTab>
          ))}
        </CategoryTabs>
      </Header>

      {/* Main Content */}
      <MainContent>
        {/* A - Sidebar */}
        <Sidebar>
          {sidebarPosts.length > 0 ? (
            sidebarPosts.map((post, index) => (
              <Link
                key={post.id}
                href={`/node/${post.id}`}
                passHref
                legacyBehavior
              >
                <NewsItem>
                  <NewsDate>{formatDate(post.publishTime)}</NewsDate>
                  <NewsTitle>{post.title}</NewsTitle>
                  {index === 0 && post.contentPreview && (
                    <NewsBrief>{post.contentPreview}</NewsBrief>
                  )}
                </NewsItem>
              </Link>
            ))
          ) : (
            <EmptyMessage>目前沒有文章</EmptyMessage>
          )}
        </Sidebar>

        {/* B - Featured Article */}
        {featuredPost && (
          <Link href={`/node/${featuredPost.id}`} passHref legacyBehavior>
            <FeaturedArticle>
              <FeaturedImageWrapper>
                <ResponsiveImage
                  resized={featuredPost.heroImage?.resized}
                  resizedWebp={featuredPost.heroImage?.resizedWebp}
                  defaultSrc={getDefaultImage(featuredPost)}
                  alt={featuredPost.title}
                  priority
                  sizes="(max-width: 767px) 100vw, (max-width: 1199px) 66vw, 740px"
                />
              </FeaturedImageWrapper>

              <FeaturedContent>
                <FeaturedDate>
                  {formatDate(featuredPost.publishTime)}
                </FeaturedDate>
                <FeaturedTitle>{featuredPost.title}</FeaturedTitle>
                {featuredPost.contentPreview && (
                  <FeaturedBrief>{featuredPost.contentPreview}</FeaturedBrief>
                )}
              </FeaturedContent>
            </FeaturedArticle>
          </Link>
        )}

        {/* C - Related Articles */}
        <RelatedArticles>
          {relatedPosts.length > 0 ? (
            relatedPosts.map((post) => {
              const image = post.heroImage?.resized
              const imageWebp = post.heroImage?.resizedWebp

              return (
                <Link
                  key={post.id}
                  href={`/node/${post.id}`}
                  passHref
                  legacyBehavior
                >
                  <RelatedArticle>
                    <RelatedImageWrapper>
                      <ResponsiveImage
                        resized={image}
                        resizedWebp={imageWebp}
                        defaultSrc={getDefaultImage(post)}
                        alt={post.title}
                        sizes="(max-width: 767px) 100vw, (max-width: 1199px) 50vw, 160px"
                      />
                    </RelatedImageWrapper>
                    <RelatedContent>
                      <RelatedDate>{formatDate(post.publishTime)}</RelatedDate>
                      <RelatedTitle>{post.title}</RelatedTitle>
                    </RelatedContent>
                  </RelatedArticle>
                </Link>
              )
            })
          ) : (
            <EmptyMessage>目前沒有相關文章</EmptyMessage>
          )}
        </RelatedArticles>
      </MainContent>
    </Container>
  )
}

export default NewsSection

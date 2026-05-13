import Link from 'next/link'
import React, { useState } from 'react'
import styled from 'styled-components'

import ResponsiveImage from '~/components/shared/responsive-image'
import { DEFAULT_POST_IMAGE_PATH } from '~/constants/constant'
import { MAX_CONTENT_WIDTH } from '~/constants/layout'
import type { SectionInfo } from '~/utils/homepage-api'
import { mergePostsWithFeatured } from '~/utils/post'

// Styled Components
const Container = styled.div`
  max-width: ${MAX_CONTENT_WIDTH};
  margin: 0 auto;
  padding: 8px 0;

  // Tablet
  @media (min-width: ${({ theme }) => theme.mediaSize.md}px) {
    padding: 0 0;
  }

  // Desktop
  @media (min-width: ${({ theme }) => theme.mediaSize.xl}px) {
    padding: 0;
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
    flex-wrap: nowrap;
  }
`

const AccentBar = styled.div`
  background-color: ${({ theme }) => theme.colors.secondary[60]};
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
  }

  // Desktop
  @media (min-width: ${({ theme }) => theme.mediaSize.xl}px) {
    width: auto;
    margin-top: 0;
    margin-left: 28px;
    flex: 1;
    min-width: 0;
    justify-content: flex-start;
  }
`

const CategoryTab = styled.button<{ $isActive?: boolean }>`
  background: none;
  border: none;
  color: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.secondary[20] : theme.colors.grayscale[20]};
  font-weight: 700;
  font-size: 20px;
  line-height: 28px;
  cursor: pointer;
  padding: 0.25rem 0;
  transition: color 0.3s ease;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    color: ${({ theme }) => theme.colors.secondary[20]};
  }
`

const ArticlesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;

  @media (min-width: ${({ theme }) => theme.mediaSize.md}px) {
    display: flex;
    flex-direction: row;
    gap: 1.5rem;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  @media (min-width: ${({ theme }) => theme.mediaSize.xl}px) {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    overflow-x: visible;
    padding: 0 78px;
  }
`

const ArticleCard = styled.span`
  display: flex;
  flex-direction: row;
  cursor: pointer;
  padding: 0 16px;
  gap: 16px;
  text-decoration: none;

  @media (min-width: ${({ theme }) => theme.mediaSize.md}px) {
    flex-direction: row;
    gap: 24px;
    padding: 0;
    flex-shrink: 0;
    width: 330px;
  }

  @media (min-width: ${({ theme }) => theme.mediaSize.xl}px) {
    flex-direction: row;
    padding: 0;
    gap: 24px;
    width: auto;
    min-width: auto;
    flex-shrink: 1;
  }
`

const ImageWrapper = styled.div`
  width: 100%;
  height: auto;
  object-fit: cover;
  aspect-ratio: 4 / 3;
  background-color: #d1d5db;
  flex-shrink: 0;
  max-width: 168px;
  min-height: 126px;
  overflow: hidden;

  @media (min-width: ${({ theme }) => theme.mediaSize.md}px) {
    flex: 1;
    max-width: none;
  }

  @media (min-width: ${({ theme }) => theme.mediaSize.xl}px) {
    flex: 1;
  }
`

const ArticleContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;

  @media (min-width: 1024px) {
    justify-content: flex-start;
  }
`

const ArticleTitle = styled.h3`
  flex: 1;
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.grayscale[0]};
  line-height: 1.5;
  margin: 0;
  transition: color 0.3s ease;

  ${ArticleCard}:hover & {
    color: ${({ theme }) => theme.colors.secondary[20]};
  }

  // Tablet
  @media (min-width: ${({ theme }) => theme.mediaSize.md}px) {
    font-size: 18px;
  }

  // Desktop
  @media (min-width: ${({ theme }) => theme.mediaSize.xl}px) {
    font-size: 18px;
  }
`

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #000;
  margin: 52px 28px 48px;

  // Tablet
  @media (min-width: ${({ theme }) => theme.mediaSize.md}px) {
    margin: 40px 44px;
  }
  // Desktop
  @media (min-width: ${({ theme }) => theme.mediaSize.xl}px) {
    margin-left: 78px;
    margin-right: 78px;
  }
`

const EmptyMessage = styled.p`
  text-align: center;
  color: #666;
  padding: 2rem;
`

type SupplementSectionProps = {
  section?: SectionInfo
}

const MAX_CATEGORY_TABS = 4

const SupplementSection = ({ section }: SupplementSectionProps) => {
  const categories = section?.categories || []
  const sectionName = section?.name || '副刊'

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
      ? sectionPosts.slice(0, 3)
      : mergePostsWithFeatured(
          currentCategory?.featuredPostsInInputOrder || [],
          currentCategory?.posts || [],
          3
        )

  return (
    <Container>
      <Divider />
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
      {/* Articles Grid */}
      <ArticlesGrid>
        {currentPosts.length > 0 ? (
          currentPosts.map((post) => {
            const image = post.heroImage?.resized
            const imageWebp = post.heroImage?.resizedWebp

            return (
              <Link key={post.id} href={`/node/${post.id}`}>
                <ArticleCard>
                  <ImageWrapper>
                    <ResponsiveImage
                      resized={image}
                      resizedWebp={imageWebp}
                      defaultSrc={DEFAULT_POST_IMAGE_PATH}
                      alt={post.title}
                      sizes="(max-width: 767px) 130px, (max-width: 1199px) 200px, 300px"
                    />
                  </ImageWrapper>
                  <ArticleContent>
                    <ArticleTitle>{post.title}</ArticleTitle>
                  </ArticleContent>
                </ArticleCard>
              </Link>
            )
          })
        ) : (
          <EmptyMessage>目前沒有文章</EmptyMessage>
        )}
      </ArticlesGrid>
      <Divider />
    </Container>
  )
}

export default SupplementSection

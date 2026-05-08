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
  padding: 36px 0;

  // Tablet
  @media (min-width: ${({ theme }) => theme.mediaSize.md}px) {
    padding: 40px 18px 0;
  }

  // Desktop
  @media (min-width: ${({ theme }) => theme.mediaSize.xl}px) {
    padding: 66px 0;
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

const ArticlesGrid = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;

  // Tablet
  @media (min-width: ${({ theme }) => theme.mediaSize.md}px) {
    grid-template-columns: repeat(2, 1fr);
  }

  // Desktop
  @media (min-width: ${({ theme }) => theme.mediaSize.xl}px) {
    padding: 0 40px;
    grid-template-columns: repeat(3, 1fr);
  }
`

const ArticleCard = styled.a`
  position: relative;
  cursor: pointer;
  overflow: hidden;
  display: block;
  text-decoration: none;
`

const ImageWrapper = styled.div`
  width: 100%;
  aspect-ratio: 4 / 3;
  background-color: #d1d5db;
  overflow: hidden;
`

const ImageOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(
    180deg,
    transparent 0%,
    rgba(217, 217, 217, 0.2) 20%,
    rgba(50, 50, 50, 0.7) 100%
  );
  padding: 12px;
  color: white;
`

const ArticleTitle = styled.h3`
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.5;
  margin: 0;
`

const EmptyMessage = styled.p`
  text-align: center;
  color: #666;
  padding: 2rem;
  grid-column: 1 / -1;
`

type SpecialColumnSectionProps = {
  section?: SectionInfo
}

const MAX_CATEGORY_TABS = 4

const SpecialColumnSection = ({ section }: SpecialColumnSectionProps) => {
  const categories = section?.categories || []
  const sectionName = section?.name || '專欄'

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
      ? sectionPosts.slice(0, 6)
      : mergePostsWithFeatured(
          currentCategory?.featuredPostsInInputOrder || [],
          currentCategory?.posts || [],
          6
        )

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

      {/* Articles Grid */}
      <ArticlesGrid>
        {currentPosts.length > 0 ? (
          currentPosts.map((post) => {
            const image = post.heroImage?.resized
            const imageWebp = post.heroImage?.resizedWebp

            return (
              <Link
                key={post.id}
                href={`/node/${post.id}`}
                passHref
                legacyBehavior
              >
                <ArticleCard>
                  <ImageWrapper>
                    <ResponsiveImage
                      resized={image}
                      resizedWebp={imageWebp}
                      defaultSrc={DEFAULT_POST_IMAGE_PATH}
                      alt={post.title}
                      sizes="(max-width: 767px) 100vw, (max-width: 1199px) 50vw, 33vw"
                    />
                  </ImageWrapper>
                  <ImageOverlay>
                    <ArticleTitle>{post.title}</ArticleTitle>
                  </ImageOverlay>
                </ArticleCard>
              </Link>
            )
          })
        ) : (
          <EmptyMessage>目前沒有文章</EmptyMessage>
        )}
      </ArticlesGrid>
    </Container>
  )
}

export default SpecialColumnSection

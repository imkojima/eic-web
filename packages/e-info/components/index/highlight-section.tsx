import Link from 'next/link'
import React from 'react'
import styled from 'styled-components'

import ResponsiveImage from '~/components/shared/responsive-image'
import { DEFAULT_POST_IMAGE_PATH } from '~/constants/constant'
import { MAX_CONTENT_WIDTH } from '~/constants/layout'
import type { HomepagePick } from '~/graphql/query/section'

// Styled Components
const Container = styled.div`
  max-width: ${MAX_CONTENT_WIDTH};
  margin: 0 auto;
  padding: 48px 0 28px;

  // Tablet
  @media (min-width: ${({ theme }) => theme.mediaSize.md}px) {
    padding: 34px 48px;
  }

  // Desktop
  @media (min-width: ${({ theme }) => theme.mediaSize.xl}px) {
    padding: 48px 0;
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
  background-color: ${({ theme }) => theme.colors.secondary[20]};
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
  color: ${({ theme }) => theme.colors.grayscale[0]};
  margin: 0;

  // Desktop
  @media (min-width: ${({ theme }) => theme.mediaSize.xl}px) {
    font-size: 28px;
    line-height: 32px;
  }
`

const ArticlesGrid = styled.div`
  display: flex;
  flex-direction: row;
  gap: 1.5rem;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding: 0 24px;

  &::-webkit-scrollbar {
    display: none;
  }

  // Tablet
  @media (min-width: ${({ theme }) => theme.mediaSize.md}px) {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-gap: 24px;
    padding: 0;
    overflow-x: visible;
  }

  // Desktop
  @media (min-width: ${({ theme }) => theme.mediaSize.xl}px) {
    padding: 0 78px;
    grid-template-columns: repeat(3, 1fr);
  }
`

const ArticleCard = styled.span`
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 200px;
  text-decoration: none;

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

const ImageContainer = styled.div`
  position: relative;
  overflow: hidden;
  margin-bottom: 12px;
  aspect-ratio: 3 / 2;
  background-color: #d1d5db;

  // Desktop
  @media (min-width: ${({ theme }) => theme.mediaSize.xl}px) {
    margin-bottom: 0;
    margin-right: 12px;
    width: 160px;
    height: 120px;
    flex-shrink: 0;
  }
`

const ArticleTitle = styled.h3`
  flex: 1;
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.secondary[20]};
  line-height: 1.5;
  margin: 0;
  transition: color 0.3s ease;

  ${ArticleCard}:hover & {
    color: ${({ theme }) => theme.colors.primary[40]};
  }

  // Desktop
  @media (min-width: ${({ theme }) => theme.mediaSize.xl}px) {
    font-size: 18px;
  }
`

type HighlightSectionProps = {
  picks?: HomepagePick[]
}

// Helper function to get image from pick
const getImage = (pick: HomepagePick) => {
  // Priority: customImage > post heroImage
  if (pick.customImage?.resized) {
    return {
      resized: pick.customImage.resized,
      resizedWebp: pick.customImage.resizedWebp,
    }
  }
  if (pick.posts?.heroImage) {
    return {
      resized: pick.posts.heroImage.resized,
      resizedWebp: pick.posts.heroImage.resizedWebp,
    }
  }
  return { resized: null, resizedWebp: null }
}

// Helper function to get title from pick
const getTitle = (pick: HomepagePick): string => {
  return pick.customTitle || pick.posts?.title || ''
}

// Helper function to get link URL from pick
const getLinkUrl = (pick: HomepagePick): string => {
  if (pick.customUrl) return pick.customUrl
  if (pick.posts?.id) return `/node/${pick.posts.id}`
  return '#'
}

const HighlightSection = ({ picks = [] }: HighlightSectionProps) => {
  // Filter picks that have valid posts or custom content
  const validPicks = picks.filter((pick) => pick.posts || pick.customTitle)

  // If no valid picks, don't render the section
  if (validPicks.length === 0) {
    return null
  }

  return (
    <Container>
      {/* Header */}
      <Header>
        <AccentBar />
        <Title>焦點話題</Title>
      </Header>
      {/* Articles Grid */}
      <ArticlesGrid>
        {validPicks.map((pick) => {
          const { resized, resizedWebp } = getImage(pick)
          const title = getTitle(pick)
          const linkUrl = getLinkUrl(pick)

          return (
            <Link key={pick.id} href={linkUrl}>
              <ArticleCard>
                <ImageContainer>
                  <ResponsiveImage
                    resized={resized}
                    resizedWebp={resizedWebp}
                    defaultSrc={DEFAULT_POST_IMAGE_PATH}
                    alt={title}
                    sizes="(max-width: 767px) 200px, (max-width: 1199px) 33vw, 160px"
                  />
                </ImageContainer>
                <ArticleTitle>{title}</ArticleTitle>
              </ArticleCard>
            </Link>
          )
        })}
      </ArticlesGrid>
    </Container>
  )
}

export default HighlightSection

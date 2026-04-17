import SharedImage from '@readr-media/react-image'
import Link from 'next/link'
import React, { useState } from 'react'
import styled from 'styled-components'

import { DEFAULT_POST_IMAGE_PATH } from '~/constants/constant'
import { MAX_CONTENT_WIDTH } from '~/constants/layout'
import type { ReadingRankingArticle, Topic } from '~/graphql/query/section'

// Styled Components
const Container = styled.div`
  max-width: ${MAX_CONTENT_WIDTH};
  margin: 0 auto;
  padding: 0;

  // Tablet
  @media (min-width: ${({ theme }) => theme.mediaSize.md}px) {
    padding: 0 0;
  }

  // Desktop
  @media (min-width: ${({ theme }) => theme.mediaSize.xl}px) {
    padding: 0 0;
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
  gap: 20px;

  // Tablet
  @media (min-width: ${({ theme }) => theme.mediaSize.md}px) {
    padding: 0 45px;
  }

  // Desktop
  @media (min-width: ${({ theme }) => theme.mediaSize.xl}px) {
    grid-template-columns: 2fr 1fr;
    padding: 0 78px;
  }
`

const LeftSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  order: 0;
`

const HeroArticle = styled.a`
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease;
  display: block;
  text-decoration: none;
`

const HeroImageWrapper = styled.div`
  width: 100%;
  aspect-ratio: 2 / 1;
  background-color: #d1d5db;

  // Tablet
  @media (min-width: ${({ theme }) => theme.mediaSize.md}px) {
    aspect-ratio: 2 / 1;
  }
`

const HeroOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.grayscale[0]};
  padding: 12px 0;
  color: white;

  // Tablet
  @media (min-width: ${({ theme }) => theme.mediaSize.md}px) {
    padding: 10px 0;
  }
`

const HeroTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  line-height: 28px;
  text-align: center;

  // Tablet
  @media (min-width: ${({ theme }) => theme.mediaSize.md}px) {
    font-size: 28px;
    line-height: 32px;
  }
`

const ArticlesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`

const ArticleItem = styled.a`
  display: grid;
  grid-template-columns: 1fr 98px;
  gap: 12px;
  padding: 0 23px;
  cursor: pointer;
  text-decoration: none;

  // Tablet
  @media (min-width: ${({ theme }) => theme.mediaSize.md}px) {
    grid-template-columns: 1fr 217px;
    gap: 16px;
    padding: 0;
  }

  // Desktop
  @media (min-width: ${({ theme }) => theme.mediaSize.xl}px) {
    grid-template-columns: 1fr 300px;
    gap: 30px;
    padding: 0;
  }
`

const ArticleContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;

  // Desktop
  @media (min-width: ${({ theme }) => theme.mediaSize.xl}px) {
    justify-content: flex-start;
    gap: 20px;
  }
`

const ArticleTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.grayscale[0]};
  margin: 0;
  line-height: 1.5;
  transition: color 0.3s ease;

  ${ArticleItem}:hover & {
    color: ${({ theme }) => theme.colors.primary[20]};
  }

  // Tablet
  @media (min-width: ${({ theme }) => theme.mediaSize.md}px) {
    font-size: 18px;
    line-height: 1.5;
  }

  // Desktop
  @media (min-width: ${({ theme }) => theme.mediaSize.xl}px) {
    font-size: 20px;
    line-height: 28px;
  }
`

const ArticleExcerpt = styled.p`
  color: ${({ theme }) => theme.colors.grayscale[20]};
  font-family: sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
  margin: 0;
  display: none;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;

  // Desktop only
  @media (min-width: ${({ theme }) => theme.mediaSize.xl}px) {
    display: -webkit-box;
  }
`

const ArticleImageWrapper = styled.div`
  width: 100%;
  height: auto;
  aspect-ratio: 4 / 3;
  background-color: #d1d5db;
  overflow: hidden;

  // Tablet
  @media (min-width: ${({ theme }) => theme.mediaSize.md}px) {
    width: 217px;
  }

  // Desktop
  @media (min-width: ${({ theme }) => theme.mediaSize.xl}px) {
    width: 300px;
  }
`

const Sidebar = styled.div`
  order: 1;
  border-left: none;

  // Tablet
  @media (min-width: ${({ theme }) => theme.mediaSize.md}px) {
    border-left: none;
  }

  // Desktop
  @media (min-width: ${({ theme }) => theme.mediaSize.xl}px) {
    border-left: 1px solid #000;
  }
`

const RankingSection = styled.div`
  padding: 40px 48px 48px 48px;

  // Desktop
  @media (min-width: ${({ theme }) => theme.mediaSize.xl}px) {
    padding: 0 0 48px 32px;
  }
`

const RankingHeader = styled.div`
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
    padding-left: 0;
    justify-content: normal;
  }
`

const RankingAccentBar = styled.div`
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

const RankingTitle = styled.h3`
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

const RankingList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;

  // Tablet
  @media (min-width: ${({ theme }) => theme.mediaSize.md}px) {
    flex-direction: row;
  }

  // Desktop
  @media (min-width: ${({ theme }) => theme.mediaSize.xl}px) {
    flex-direction: column;
  }
`

const RankingItem = styled.a`
  display: flex;
  flex-direction: column;
  gap: 8px;
  cursor: pointer;
  text-decoration: none;
`

const RankingNumber = styled.div`
  font-size: 48px;
  line-height: 1.25;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.primary[20]};
  min-width: 2rem;
  text-align: center;

  // Tablet
  @media (min-width: ${({ theme }) => theme.mediaSize.md}px) {
    text-align: left;
  }

  // Desktop
  @media (min-width: ${({ theme }) => theme.mediaSize.xl}px) {
    text-align: left;
  }
`

const RankingContent = styled.div`
  flex: 1;
`

const RankingItemTitle = styled.h4`
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.grayscale[0]};
  margin: 0;
  line-height: 28px;

  ${RankingItem}:hover & {
    color: ${({ theme }) => theme.colors.primary[20]};
  }
`

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #000;
  margin: 20px 28px 16px;

  // Tablet
  @media (min-width: ${({ theme }) => theme.mediaSize.md}px) {
    margin-left: 44px;
    margin-right: 44px;
  }
  // Desktop
  @media (min-width: ${({ theme }) => theme.mediaSize.xl}px) {
    display: none;
  }
`

const EmptyMessage = styled.p`
  text-align: center;
  color: #666;
  padding: 2rem;
`

type FeaturedTopicsSectionProps = {
  topics?: Topic[]
  rankings?: ReadingRankingArticle[]
}

const FeaturedTopicsSection = ({
  topics = [],
  rankings = [],
}: FeaturedTopicsSectionProps) => {
  // Filter topics that have posts
  const topicsWithPosts = topics.filter(
    (topic) => topic.posts && topic.posts.length > 0
  )

  const [activeTopic, setActiveTopic] = useState<string>('')

  const handleTopicClick = (topicId: string) => {
    setActiveTopic(topicId)
  }

  // If no topics with posts, don't render the section
  if (topicsWithPosts.length === 0) {
    return null
  }

  // When no tab is selected (activeTopic === ''), show other topics in the list
  // (each item links to /feature/[id]). When a tab is selected, show that
  // topic's posts (each item links to /node/[id]).
  let heroTopic: (typeof topicsWithPosts)[0] | undefined
  let listItems: {
    id: string
    title: string
    excerpt?: string | null
    heroImage: (typeof topicsWithPosts)[0]['heroImage']
    href: string
  }[]

  if (activeTopic === '') {
    heroTopic = topicsWithPosts[0]
    listItems = topicsWithPosts.slice(1, 4).map((topic) => ({
      id: topic.id,
      title: topic.title,
      excerpt: topic.content,
      heroImage: topic.heroImage,
      href: `/feature/${topic.id}`,
    }))
  } else {
    const currentTopic = topicsWithPosts.find(
      (topic) => topic.id === activeTopic
    )
    heroTopic = currentTopic
    listItems = (currentTopic?.posts || []).slice(0, 3).map((post) => ({
      id: post.id,
      title: post.title,
      excerpt: post.contentPreview,
      heroImage: post.heroImage,
      href: `/node/${post.id}`,
    }))
  }

  return (
    <Container>
      {/* Header */}
      <Header>
        <AccentBar />
        <TitleButton onClick={() => setActiveTopic('')}>深度專題</TitleButton>
        <CategoryTabs>
          {topicsWithPosts.map((topic) => (
            <CategoryTab
              key={topic.id}
              $isActive={activeTopic === topic.id}
              onClick={() => handleTopicClick(topic.id)}
            >
              {topic.title}
            </CategoryTab>
          ))}
        </CategoryTabs>
      </Header>

      {/* Main Content */}
      <MainContent>
        <LeftSection>
          {/* Hero Article - Links to topic page */}
          {heroTopic && (
            <Link href={`/feature/${heroTopic.id}`} passHref legacyBehavior>
              <HeroArticle>
                <HeroImageWrapper>
                  <SharedImage
                    key={`hero-${activeTopic}-${heroTopic.id}`}
                    images={heroTopic.heroImage?.resized || {}}
                    imagesWebP={heroTopic.heroImage?.resizedWebp || {}}
                    defaultImage={DEFAULT_POST_IMAGE_PATH}
                    alt={heroTopic.title}
                    priority={true}
                    rwd={{
                      mobile: '100vw',
                      tablet: '100vw',
                      desktop: '760px',
                      default: '760px',
                    }}
                  />
                </HeroImageWrapper>
                <HeroOverlay>
                  <HeroTitle>{heroTopic.title}</HeroTitle>
                </HeroOverlay>
              </HeroArticle>
            </Link>
          )}

          {/* List items - topics when no tab selected, posts otherwise */}
          <ArticlesList>
            {listItems.length > 0 ? (
              listItems.map((item) => {
                const image = item.heroImage?.resized
                const imageWebp = item.heroImage?.resizedWebp

                return (
                  <Link key={item.id} href={item.href} passHref legacyBehavior>
                    <ArticleItem>
                      <ArticleContent>
                        <ArticleTitle>{item.title}</ArticleTitle>
                        {item.excerpt && (
                          <ArticleExcerpt>{item.excerpt}</ArticleExcerpt>
                        )}
                      </ArticleContent>
                      <ArticleImageWrapper>
                        <SharedImage
                          key={`article-${activeTopic}-${item.id}`}
                          images={image || {}}
                          imagesWebP={imageWebp || {}}
                          defaultImage={DEFAULT_POST_IMAGE_PATH}
                          alt={item.title}
                          priority={false}
                          rwd={{
                            mobile: '130px',
                            tablet: '289px',
                            desktop: '400px',
                            default: '400px',
                          }}
                        />
                      </ArticleImageWrapper>
                    </ArticleItem>
                  </Link>
                )
              })
            ) : (
              <EmptyMessage>目前沒有文章</EmptyMessage>
            )}
          </ArticlesList>
        </LeftSection>

        {/* Sidebar */}
        <Sidebar>
          <Divider />
          <RankingSection>
            <RankingHeader>
              <RankingAccentBar />
              <RankingTitle>閱讀排名</RankingTitle>
            </RankingHeader>
            <RankingList>
              {rankings.slice(0, 3).map((item) => (
                <Link
                  key={item.post_id}
                  href={`/node/${item.post_id}`}
                  passHref
                  legacyBehavior
                >
                  <RankingItem>
                    <RankingNumber>{item.rank}</RankingNumber>
                    <RankingContent>
                      <RankingItemTitle>{item.article.title}</RankingItemTitle>
                    </RankingContent>
                  </RankingItem>
                </Link>
              ))}
            </RankingList>
          </RankingSection>
        </Sidebar>
      </MainContent>
    </Container>
  )
}

export default FeaturedTopicsSection

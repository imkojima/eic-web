// 深度專題列表頁面
// @ts-ignore: no definition
import errors from '@twreporter/errors'
import type { GetServerSideProps } from 'next'
import Link from 'next/link'
import type { ReactElement } from 'react'
import styled from 'styled-components'

import { getGqlClient } from '~/apollo-client'
import LayoutGeneral from '~/components/layout/layout-general'
import { DEFAULT_POST_IMAGE_PATH } from '~/constants/constant'
import { MAX_CONTENT_WIDTH } from '~/constants/layout'
import type { HeaderContextData } from '~/contexts/header-context'
import type { Topic } from '~/graphql/query/section'
import { allTopics, allTopicsFallback } from '~/graphql/query/section'
import type { NextPageWithLayout } from '~/pages/_app'
import { setCacheControl } from '~/utils/common'
import * as gtag from '~/utils/gtag'
import { fetchHeaderData } from '~/utils/header-data'
import { formatPostDate, rawContentToPlainText } from '~/utils/post'

const PageWrapper = styled.div`
  max-width: ${MAX_CONTENT_WIDTH};
  margin: 0 auto;
  padding: 26px 27px 0;

  ${({ theme }) => theme.breakpoint.md} {
    padding: 28px 98px 0;
  }

  ${({ theme }) => theme.breakpoint.xl} {
    padding: 36px 58px 0;
  }
`

const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 28px;
  gap: 12px;
  padding-bottom: 24px;
  border-bottom: 4px solid ${({ theme }) => theme.colors.secondary[20]};

  ${({ theme }) => theme.breakpoint.xl} {
    margin-bottom: 28px;
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
  color: ${({ theme }) => theme.colors.secondary[20]};
  margin: 0;

  // Desktop
  @media (min-width: ${({ theme }) => theme.mediaSize.xl}px) {
    font-size: 28px;
    line-height: 32px;
  }
`

const FeaturedSection = styled.section`
  margin-bottom: 60px;

  ${({ theme }) => theme.breakpoint.xl} {
    margin-bottom: 48px;
  }
`

const FeaturedArticle = styled.article`
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  margin-bottom: 40px;

  ${({ theme }) => theme.breakpoint.md} {
    gap: 24px;
  }

  ${({ theme }) => theme.breakpoint.xl} {
    grid-template-columns: 680px 1fr;
  }
`

const FeaturedImageWrapper = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 2 / 1;
  overflow: hidden;
  background-color: #f0f0f0;
`

const FeaturedImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`

const FeaturedContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`

const FeaturedTextContent = styled.div``

const FeaturedTitle = styled.h2`
  font-size: 28px;
  font-weight: 500;
  line-height: 32px;
  color: ${({ theme }) => theme.colors.secondary[20]};
  margin: 0 0 12px;
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.secondary[0]};
  }

  ${({ theme }) => theme.breakpoint.md} {
    font-size: 28px;
    margin-bottom: 16px;
  }

  ${({ theme }) => theme.breakpoint.xl} {
    font-size: 36px;
    line-height: 1.25;
    margin-bottom: 20px;
  }
`

const FeaturedDate = styled.time`
  display: block;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.grayscale[20]};
  margin-bottom: 24px;

  ${({ theme }) => theme.breakpoint.md} {
    font-size: 16px;
  }
`

const FeaturedExcerpt = styled.p`
  font-family: sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.8;
  color: ${({ theme }) => theme.colors.grayscale[20]};
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;

  ${({ theme }) => theme.breakpoint.md} {
    font-size: 16px;
  }
`

const EnterButton = styled.a`
  display: none;
  align-self: flex-end;
  padding: 0;
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.secondary[40]};
  text-decoration: underline;
  border: none;
  background: none;
  cursor: pointer;
  margin-top: 20px;

  &:hover {
    color: ${({ theme }) => theme.colors.secondary[20]};
  }

  ${({ theme }) => theme.breakpoint.md} {
    font-size: 18px;
  }

  ${({ theme }) => theme.breakpoint.xl} {
    display: inline-block;
  }
`

const MobileEnterButton = styled.a`
  display: block;
  text-align: center;
  padding: 0;
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.secondary[40]};
  text-decoration: underline;
  border: none;
  background: none;
  cursor: pointer;
  margin: 32px auto 0;

  &:hover {
    color: ${({ theme }) => theme.colors.secondary[20]};
  }

  ${({ theme }) => theme.breakpoint.md} {
    font-size: 18px;
  }

  ${({ theme }) => theme.breakpoint.xl} {
    display: none;
  }
`

const ArticleGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
  padding: 0 33px;

  ${({ theme }) => theme.breakpoint.md} {
    padding: 0;
    gap: 24px;
  }

  ${({ theme }) => theme.breakpoint.xl} {
    grid-template-columns: repeat(3, 1fr);
    gap: 32px;
  }
`

const ArticleCard = styled.a`
  display: block;
  text-decoration: none;
  cursor: pointer;

  ${({ theme }) => theme.breakpoint.md} {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 20px;
    align-items: start;
  }

  ${({ theme }) => theme.breakpoint.xl} {
    display: block;
  }
`

const ArticleImageWrapper = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 2 / 1;
  overflow: hidden;
  background-color: #f0f0f0;
  margin-bottom: 12px;

  ${({ theme }) => theme.breakpoint.md} {
    margin-bottom: 0;
    width: 280px;
    flex-shrink: 0;
  }

  ${({ theme }) => theme.breakpoint.xl} {
    width: 100%;
    margin-bottom: 12px;
  }
`

const ArticleImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`

const ArticleContent = styled.div`
  display: flex;
  flex-direction: column;
`

const ArticleDate = styled.time`
  display: block;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.grayscale[20]};
  margin-bottom: 8px;
`

const ArticleTitle = styled.h3`
  font-size: 18px;
  font-weight: 500;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.grayscale[20]};
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const Divider = styled.hr`
  border: none;
  border-top: 2px solid ${({ theme }) => theme.colors.secondary[20]};
  margin: 48px 0;

  ${({ theme }) => theme.breakpoint.xl} {
    margin: 48px 0;
  }
`

// Helper function to get image URL from topic (with fallback to default image)
const getTopicImageUrl = (topic: Topic): string => {
  const resized = topic.heroImage?.resized
  const resizedWebp = topic.heroImage?.resizedWebp
  return (
    resizedWebp?.w800 ||
    resizedWebp?.w480 ||
    resized?.w800 ||
    resized?.w480 ||
    resized?.original ||
    DEFAULT_POST_IMAGE_PATH
  )
}

type PageProps = {
  headerData: HeaderContextData
  topics: Topic[]
}

const FeaturedTopicsPage: NextPageWithLayout<PageProps> = ({ topics }) => {
  // Display all topics as featured articles
  // Only the first topic shows its related posts (up to 3) in the grid below
  // (isPinned is only used for homepage display, not for this listing page)
  const firstTopicPosts = topics[0]?.posts || []

  const renderFeaturedArticle = (topic: Topic, index: number) => {
    const topicHref = `/feature/${topic.id}`
    const topicImage = getTopicImageUrl(topic)
    const topicDate = topic.publishTime
      ? formatPostDate(topic.publishTime)
      : topic.updatedAt
      ? formatPostDate(topic.updatedAt)
      : ''

    return (
      <FeaturedSection key={topic.id}>
        <FeaturedArticle>
          <FeaturedImageWrapper>
            <Link href={topicHref} passHref legacyBehavior>
              <a
                onClick={() =>
                  gtag.sendEvent(
                    'featured-topics',
                    'click',
                    `featured-${topic.title}`
                  )
                }
              >
                <FeaturedImage src={topicImage} alt={topic.title || ''} />
              </a>
            </Link>
          </FeaturedImageWrapper>

          <FeaturedContent>
            <FeaturedTextContent>
              <Link href={topicHref}>
                <FeaturedTitle>{topic.title}</FeaturedTitle>
              </Link>
              <FeaturedDate>{topicDate}</FeaturedDate>
              {(() => {
                const excerpt = rawContentToPlainText(topic.content)
                return excerpt ? (
                  <FeaturedExcerpt>{excerpt}</FeaturedExcerpt>
                ) : null
              })()}
            </FeaturedTextContent>
            <Link href={topicHref} passHref legacyBehavior>
              <EnterButton
                onClick={() =>
                  gtag.sendEvent(
                    'featured-topics',
                    'click',
                    `enter-${topic.title}`
                  )
                }
              >
                進入專題
              </EnterButton>
            </Link>
          </FeaturedContent>
        </FeaturedArticle>

        {/* Show article grid with first topic's posts (max 3) */}
        {index === 0 && firstTopicPosts.length > 0 && (
          <ArticleGrid>
            {firstTopicPosts.map((post) => {
              const postHref = `/node/${post.id}`
              const postImage =
                post.heroImage?.resizedWebp?.w480 ||
                post.heroImage?.resized?.w480 ||
                post.heroImage?.resized?.original ||
                DEFAULT_POST_IMAGE_PATH
              const postDate = formatPostDate(post.publishTime)

              return (
                <Link key={post.id} href={postHref} passHref legacyBehavior>
                  <ArticleCard
                    onClick={() =>
                      gtag.sendEvent(
                        'featured-topics',
                        'click',
                        `article-${post.title}`
                      )
                    }
                  >
                    <ArticleImageWrapper>
                      <ArticleImage src={postImage} alt={post.title || ''} />
                    </ArticleImageWrapper>
                    <ArticleContent>
                      <ArticleDate>{postDate}</ArticleDate>
                      <ArticleTitle>{post.title}</ArticleTitle>
                    </ArticleContent>
                  </ArticleCard>
                </Link>
              )
            })}
          </ArticleGrid>
        )}
        <Link href={topicHref} passHref legacyBehavior>
          <MobileEnterButton
            onClick={() =>
              gtag.sendEvent('featured-topics', 'click', `enter-${topic.title}`)
            }
          >
            進入專題
          </MobileEnterButton>
        </Link>
        <Divider />
      </FeaturedSection>
    )
  }

  return (
    <PageWrapper>
      <SectionTitle>
        <AccentBar />
        <Title>深度專題</Title>
      </SectionTitle>

      {topics.map((topic, index) => renderFeaturedArticle(topic, index))}
    </PageWrapper>
  )
}

export const getServerSideProps: GetServerSideProps<PageProps> = async ({
  res,
}) => {
  setCacheControl(res)

  const client = getGqlClient()

  try {
    // fetch header data
    const headerData = await fetchHeaderData()

    // Try publishTime ordering first, fallback to updatedAt if backend
    // hasn't added the publishTime field yet
    let topics: Topic[] = []
    try {
      const { data, error: gqlError } = await client.query<{
        topics: Topic[]
      }>({
        query: allTopics,
      })
      if (gqlError) throw gqlError
      topics = data?.topics || []
    } catch {
      console.warn(
        '[Feature] allTopics (publishTime) failed, falling back to updatedAt'
      )
      const { data } = await client.query<{ topics: Topic[] }>({
        query: allTopicsFallback,
      })
      topics = data?.topics || []
    }

    // Sort by publishTime (fallback to updatedAt) descending
    topics.sort((a, b) => {
      const timeA = new Date(a.publishTime || a.updatedAt || 0).getTime()
      const timeB = new Date(b.publishTime || b.updatedAt || 0).getTime()
      return timeB - timeA
    })

    return {
      props: {
        headerData,
        topics,
      },
    }
  } catch (err) {
    const annotatingError = errors.helpers.wrap(
      err,
      'UnhandledError',
      'Error occurs while fetching topics data'
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

    // Return empty headerData on error
    return {
      props: {
        headerData: {
          sections: [],
          featuredTags: [],
          topics: [],
          newsBarPicks: [],
          siteConfigs: [],
        },
        topics: [],
      },
    }
  }
}

FeaturedTopicsPage.getLayout = function getLayout(
  page: ReactElement<PageProps>
) {
  return (
    <LayoutGeneral
      title="深度專題"
      description="探討環境、能源、氣候等重要議題的深度報導"
    >
      {page}
    </LayoutGeneral>
  )
}

export default FeaturedTopicsPage

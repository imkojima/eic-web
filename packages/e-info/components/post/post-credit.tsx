import Link from 'next/link'
import styled from 'styled-components'

import type { Author } from '~/graphql/fragments/author'
import type { PostDetail } from '~/graphql/query/post'

import MediaLinkList from '../shared/media-link'
import PostTag from './tag'

const PostCreditWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 16px;
  padding: 0px 20px;
  text-align: center;

  ul,
  ul > li {
    justify-content: center;
  }

  ${({ theme }) => theme.breakpoint.md} {
    padding: 0;
  }

  ${({ theme }) => theme.breakpoint.xl} {
    margin-top: 0;
    padding: 0;
    max-width: 180px;
    text-align: left;

    ul,
    ul > li {
      justify-content: flex-start;
    }
  }
`

const SnsLinksWrapper = styled.div`
  margin-top: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grayscale[60]};
`

const TagSection = styled.div`
  margin-top: 20px;
`

const CreditList = styled.ul`
  > li {
    font-size: 14px;
    line-height: 1.5;
    display: flex;
    align-items: flex-start;

    .dataAnalysts,
    .otherWriters {
      min-width: 56px;

      ${({ theme }) => theme.breakpoint.md} {
        min-width: 64px;
      }
    }
  }

  > li + li {
    margin: 4px 0 0;
  }

  ${({ theme }) => theme.breakpoint.md} {
    margin: 0;

    > li {
      font-size: 16px;
    }
  }
`

const CreditName = styled.span`
  font-weight: 400;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.grayscale[40]};
`

const SectionPath = styled.div`
  font-size: 16px;
  font-weight: 700;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.grayscale[0]};
  margin-bottom: 8px;

  a {
    color: ${({ theme }) => theme.colors.grayscale[0]};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`

type PostProps = {
  postData: PostDetail
  hideBookmark?: boolean
}

// Helper function to render author list with links
function renderAuthorList(authors: Author[], label: string) {
  if (!authors || authors.length === 0) return null
  return (
    <li>
      <CreditName>
        {label}—
        {authors.map((author, index) => (
          <span key={author.id}>
            {index > 0 && '、'}
            <Link href={`/author/${author.id}`}>{author.name}</Link>
          </span>
        ))}
      </CreditName>
    </li>
  )
}

export default function PostCredit({
  postData,
  hideBookmark = false,
}: PostProps): JSX.Element {
  const reporters = postData?.reportersInInputOrder?.length
    ? postData.reportersInInputOrder
    : postData?.reporters ?? []
  const stringers = postData?.stringersInInputOrder?.length
    ? postData.stringersInInputOrder
    : postData?.stringers ?? []
  const translators = postData?.translatorsInInputOrder?.length
    ? postData.translatorsInInputOrder
    : postData?.translators ?? []
  const reviewers = postData?.reviewersInInputOrder?.length
    ? postData.reviewersInInputOrder
    : postData?.reviewers ?? []
  const writers = postData?.writersInInputOrder?.length
    ? postData.writersInInputOrder
    : postData?.writers ?? []
  const sources = postData?.sourcesInInputOrder?.length
    ? postData.sourcesInInputOrder
    : postData?.sources ?? []
  const otherByline = postData?.otherByline
  const section = postData?.section
  const categories = postData?.categories ?? []

  return (
    <PostCreditWrapper>
      {(section || categories.length > 0) && (
        <SectionPath>
          {section && (
            <Link href={`/section/${section.slug}`}>{section.name}</Link>
          )}
          {section && categories.length > 0 && '/'}
          {categories.map((cat, index) => (
            <span key={cat.id}>
              {index > 0 && ', '}
              <Link href={`/category/${cat.id}`}>{cat.name}</Link>
            </span>
          ))}
        </SectionPath>
      )}
      <CreditList>
        {renderAuthorList(reporters, '記者')}
        {renderAuthorList(stringers, '特約記者')}
        {renderAuthorList(translators, '編譯')}
        {renderAuthorList(reviewers, '審校')}
        {renderAuthorList(writers, '文')}
        {renderAuthorList(sources, '稿源')}

        {otherByline && (
          <li>
            <CreditName>{otherByline}</CreditName>
          </li>
        )}

        {postData?.locations && postData.locations.length > 0 && (
          <li>
            <CreditName>
              環境資訊中心{' '}
              {postData.locations.map((loc) => loc.name).join('、')}報導
            </CreditName>
          </li>
        )}
      </CreditList>

      <TagSection>
        <PostTag tags={postData?.tags} />
      </TagSection>

      <SnsLinksWrapper>
        <MediaLinkList postId={postData?.id} hideBookmark={hideBookmark} />
      </SnsLinksWrapper>
    </PostCreditWrapper>
  )
}

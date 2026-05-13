// 該元件作為文章資訊卡片使用

import Link from 'next/link'
import styled from 'styled-components'

import PostTag from '~/components/post/tag'
import { DEFAULT_POST_IMAGE_PATH } from '~/constants/constant'
import type { ArticleCard } from '~/types/component'

import DateInfo from './date-info'
import ReportLabel from './report-label'
import ResponsiveImage from './responsive-image'

type StyledProps = {
  $shouldReverseInMobile: boolean
  $shouldHighlightReport: boolean
}

const CardContainer = styled.article<StyledProps>`
  display: flex;
  position: relative;
  border-radius: 2px;
  cursor: pointer;
  ${({ theme }) => theme.breakpoint.sm} {
    display: block;
  }

  ${({ $shouldReverseInMobile }) =>
    $shouldReverseInMobile &&
    `
      flex-direction: column;
      justify-content: space-between;
    `}

  ${({ theme, $shouldHighlightReport }) =>
    $shouldHighlightReport &&
    `
      background-color: #f5f0ff;
      padding: 12px 8px 12px 0;
      ${theme.breakpoint.sm} {
        padding: 0 0 12px;
      }
    `}
`

const CardLink = styled.span`
  position: absolute;
  inset: 0;
  z-index: 0;
`

const ImageWrapper = styled.div<StyledProps>`
  display: inline-block;
  align-self: flex-start;
  width: 100%;
  margin: 0 16px 0 0;
  overflow: hidden;
  border-radius: 2px;
  aspect-ratio: 4 / 3;

  > picture {
    display: block;
    width: 100%;
    height: 100%;
  }

  > picture img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

const TextWrapper = styled.div<Pick<StyledProps, '$shouldHighlightReport'>>`
  .title {
    font-size: 18px;
    line-height: 1.5;
    font-weight: 700;
    text-align: left;
    margin-top: 12px;
    color: ${({ theme }) => theme.colors.grayscale[0]};
    transition: color 0.3s ease;

    // Display an ellipsis (...) for titles that exceed 4 lines
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }

  &:hover .title {
    color: ${({ theme }) => theme.colors.primary[20]};
  }

  .summary {
    margin-top: 24px;

    p {
      font-family: sans-serif;
      font-size: 16px;
      font-weight: 400;
      line-height: 24px;
      letter-spacing: 0;
      color: ${({ theme }) => theme.colors.grayscale[20]};
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
      overflow: hidden;
    }

    ${({ theme }) => theme.breakpoint.xl} {
      margin-top: 20px;
    }
  }

  .tags {
    margin-top: 24px;

    ${({ theme }) => theme.breakpoint.xl} {
      margin-top: 32px;
    }
  }

  // custom style for <DateInfo />
  .time {
    font-size: 14px;
    line-height: 1.5;
    font-weight: 400;
    margin-top: 12px;
    color: ${({ theme }) => theme.colors.primary[40]};
  }

  ${({ theme, $shouldHighlightReport }) =>
    $shouldHighlightReport &&
    `
      position: relative;
      padding: 0 0 0 20px;
      ${theme.breakpoint.sm} {
        padding: 0 12px 0 24px;
      }
      &::before {
        content: '';
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        width: 8px;
        background-color: ${theme.colors.primary[20]};
      }
    `}
`

type ArticleListCardProps = Omit<ArticleCard, 'id'> & {
  shouldReverseInMobile?: boolean
  shouldHighlightReport?: boolean
  shouldHideBottomInfos?: boolean
  shouldNotLazyload?: boolean
  onClick?: () => any
  sizes?: string
  defaultImage?: string
}

export default function ArticleListCard({
  href = '/',
  title = '',
  summary = '',
  images = {},
  imagesWebP = {},
  date = '',
  tags = [],
  isReport = false,
  shouldReverseInMobile = false,
  shouldHighlightReport = false,
  shouldHideBottomInfos = false,
  shouldNotLazyload = false,
  onClick,
  sizes,
  defaultImage = DEFAULT_POST_IMAGE_PATH,
}: ArticleListCardProps): JSX.Element {
  const isReportAndShouldHighlight = isReport && shouldHighlightReport

  return (
    <CardContainer
      $shouldReverseInMobile={shouldReverseInMobile}
      $shouldHighlightReport={isReportAndShouldHighlight}
    >
      <Link href={href}>
        <CardLink onClick={onClick} />
      </Link>
      <ImageWrapper
        $shouldReverseInMobile={shouldReverseInMobile}
        $shouldHighlightReport={isReportAndShouldHighlight}
      >
        <ResponsiveImage
          resized={images}
          resizedWebp={imagesWebP}
          defaultSrc={defaultImage}
          alt={title}
          priority={shouldNotLazyload}
          sizes={sizes}
        />
        {isReport && <ReportLabel />}
      </ImageWrapper>
      <TextWrapper $shouldHighlightReport={isReportAndShouldHighlight}>
        {!shouldHideBottomInfos && <DateInfo date={date} />}
        <div className="title">
          <p>{title}</p>
        </div>
        {summary && (
          <div className="summary">
            <p>{summary}</p>
          </div>
        )}
        {tags.length > 0 && (
          <div className="tags" style={{ position: 'relative', zIndex: 1 }}>
            <PostTag tags={tags} />
          </div>
        )}
      </TextWrapper>
    </CardContainer>
  )
}

import { ContentBlock, ContentState } from 'draft-js'
import React from 'react'
import styled from 'styled-components'
import CustomImage from '@readr-media/react-image'

// Root-relative path served by the consuming app's /public directory — see
// image-block.tsx for why the bundled asset import 404s in production.
const defaultImage = '/post-default.png'

import {
  defaultH2Style,
  defaultUlStyle,
  defaultUnorderedListStyle,
  defaultOlStyle,
  defaultOrderedListStyle,
  defaultLinkStyle,
  defaultBlockQuoteStyle,
} from '../shared-style'

const infoboxDefaultSpacing = 8

const InfoBoxRenderWrapper = styled.div`
  background: ${({ theme }) => theme.colors.grayscale[99]};
  border: 1px solid ${({ theme }) => theme.colors.primary[40]};
  position: relative;
  padding: 10px;
  width: 100%;
  ${({ theme }) => theme.margin.default};
`

const InfoBoxLayout = styled.div`
  display: flex;
  flex-direction: column;

  ${({ theme }) => theme.breakpoint.md} {
    flex-direction: row;
    gap: 24px;
  }
`

const InfoTextArea = styled.div`
  flex: 1;
  min-width: 0;
`

const InfoTitle = styled.div`
  width: 100%;
  font-style: normal;
  font-weight: 700;
  ${({ theme }) => theme.fontSize.lg};
  line-height: 1.5;
  letter-spacing: 0.03em;
  color: #2d7a4f;
  padding: 0;
  margin-bottom: 16px;
`

const InfoContent = styled.div`
  padding: 0;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.grayscale[40]};

  > div > * + * {
    margin: ${infoboxDefaultSpacing}px 0 0;
    min-height: 0.01px; //to make margins between paragraphs effective
  }

  h2 {
    ${defaultH2Style}
  }

  ul {
    ${defaultUlStyle}
    margin-top: ${infoboxDefaultSpacing}px;

    > li {
      ${defaultUnorderedListStyle}

      & + li {
        margin: ${infoboxDefaultSpacing / 2}px 0 0;
      }
    }
  }

  ol {
    ${defaultOlStyle}
    margin-top: ${infoboxDefaultSpacing}px;

    > li {
      ${defaultOrderedListStyle}

      & + li {
        margin: ${infoboxDefaultSpacing / 2}px 0 0;
      }
    }
  }

  a {
    ${defaultLinkStyle}
  }

  blockquote {
    ${defaultBlockQuoteStyle}
  }
`

const InfoImage = styled.div`
  width: 100%;
  max-width: 250px;
  margin: 0 0 16px;
  flex-shrink: 0;

  img {
    width: 100%;
    height: auto !important;
    display: block;
  }

  ${({ theme }) => theme.breakpoint.md} {
    margin: 0;
  }
`

const InfoImageCaption = styled.div`
  font-size: 12px;
  line-height: 1.25;
  color: ${({ theme }) => theme.colors.grayscale[40]};
  margin-top: 8px;
  overflow-wrap: break-word;
  word-break: break-word;
`

const ParagraphDivider = styled.hr`
  border: none;
  margin: 16px 0;
`

type InfoBoxParagraph = {
  body?: string
  image?: {
    id?: string
    name?: string
    resized?: Record<string, string>
    imageFile?: { url?: string; width?: number; height?: number }
  }
  caption?: string
  rawContentState?: unknown
}

type InfoBoxBlockProps = {
  block: ContentBlock
  blockProps: {
    onEditStart: () => void
    onEditFinish: ({
      entityKey,
      entityData,
    }: {
      entityKey?: string
      entityData?: Record<string, unknown>
    }) => void
  }
  contentState: ContentState
}

function InfoBoxParagraphItem({
  paragraph,
  title,
}: {
  paragraph: InfoBoxParagraph
  title?: string
}) {
  const { body, image, caption } = paragraph
  const hasImage = image?.resized || image?.imageFile?.url

  if (!hasImage) {
    return (
      <InfoContent className="infobox-content">
        {body && <div dangerouslySetInnerHTML={{ __html: body }} />}
      </InfoContent>
    )
  }

  return (
    <InfoBoxLayout>
      <InfoImage>
        <CustomImage
          images={image.resized || {}}
          defaultImage={defaultImage}
          alt={image.name || caption || title || ''}
          rwd={{
            mobile: '100vw',
            tablet: '240px',
            desktop: '240px',
            default: '100%',
          }}
        />
        {caption && <InfoImageCaption>{caption}</InfoImageCaption>}
      </InfoImage>
      <InfoTextArea>
        <InfoContent className="infobox-content">
          {body && <div dangerouslySetInnerHTML={{ __html: body }} />}
        </InfoContent>
      </InfoTextArea>
    </InfoBoxLayout>
  )
}

export function InfoBoxBlock(props: InfoBoxBlockProps) {
  const { block, contentState } = props
  const entityKey = block.getEntityAt(0)
  const entity = contentState.getEntity(entityKey)
  const { title, body, image, paragraphs } = entity.getData()

  // New format: paragraphs array
  if (paragraphs && Array.isArray(paragraphs) && paragraphs.length > 0) {
    return (
      <InfoBoxRenderWrapper className="infobox-wrapper">
        {title && <InfoTitle className="infobox-title">{title}</InfoTitle>}
        {paragraphs.map((paragraph: InfoBoxParagraph, index: number) => (
          <React.Fragment key={index}>
            {index > 0 && <ParagraphDivider />}
            <InfoBoxParagraphItem paragraph={paragraph} title={title} />
          </React.Fragment>
        ))}
      </InfoBoxRenderWrapper>
    )
  }

  // Legacy format: single body + image
  const hasImage = image?.resized || image?.imageFile?.url

  return (
    <InfoBoxRenderWrapper className="infobox-wrapper">
      {hasImage ? (
        <InfoBoxLayout>
          <InfoImage>
            <CustomImage
              images={image.resized || {}}
              defaultImage={defaultImage}
              alt={image.name || image.caption || title}
              rwd={{
                mobile: '100vw',
                tablet: '240px',
                desktop: '240px',
                default: '100%',
              }}
            />
            {image.caption && (
              <InfoImageCaption>{image.caption}</InfoImageCaption>
            )}
          </InfoImage>
          <InfoTextArea>
            <InfoTitle className="infobox-title">{title}</InfoTitle>
            <InfoContent className="infobox-content">
              <div dangerouslySetInnerHTML={{ __html: body }} />
            </InfoContent>
          </InfoTextArea>
        </InfoBoxLayout>
      ) : (
        <>
          <InfoTitle className="infobox-title">{title}</InfoTitle>
          <InfoContent className="infobox-content">
            <div dangerouslySetInnerHTML={{ __html: body }} />
          </InfoContent>
        </>
      )}
    </InfoBoxRenderWrapper>
  )
}

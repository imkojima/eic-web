import { ContentBlock, ContentState } from 'draft-js'
import React from 'react'
import styled from 'styled-components'
import CustomImage from '@readr-media/react-image'

// Root-relative path served by the consuming app's /public directory.
// The babel file-loader asset import previously used here bakes in a build-time
// path (dev: `/lib/public/[hash].png`, prod: an unpkg URL) that isn't reachable
// from the consuming app's origin, so the fallback 404s exactly when it's needed.
const defaultImage = '/post-default.png'

const Figure = styled.figure`
  width: 100%;
  ${({ theme }) => theme.margin.default};
`

const FigureCaption = styled.figcaption`
  width: 100%;
  font-size: 12px;
  line-height: 1.25;
  text-align: justify;
  color: #373740;
  padding: 0;
  margin: 8px 0 0;

  ${({ theme }) => theme.breakpoint.xl} {
    line-height: 1.25;
  }
`
const CaptionLink = styled.a`
  color: ${({ theme }) => theme.colors.primary[20]};
  text-decoration: underline;

  &:hover {
    color: ${({ theme }) => theme.colors.primary[0]};
  }
`

type EntityRange = { key: number; offset: number; length: number }
type CaptionBlock = {
  key?: string
  text?: string
  entityRanges?: EntityRange[]
}
type CaptionEntity = { type?: string; data?: { url?: string } }
type CaptionRichTextData = {
  blocks?: CaptionBlock[]
  entityMap?: Record<string | number, CaptionEntity>
}

function renderCaptionBlock(
  block: CaptionBlock,
  entityMap: Record<string | number, CaptionEntity>
): React.ReactNode {
  const text = block.text ?? ''
  const ranges = (block.entityRanges ?? [])
    .slice()
    .sort((a, b) => a.offset - b.offset)
  if (!ranges.length) return text

  const segments: React.ReactNode[] = []
  let cursor = 0
  ranges.forEach((range, i) => {
    if (range.offset > cursor) {
      segments.push(text.slice(cursor, range.offset))
    }
    const entity = entityMap[range.key]
    const slice = text.slice(range.offset, range.offset + range.length)
    if (entity?.type === 'LINK' && entity.data?.url) {
      segments.push(
        <CaptionLink
          key={`${block.key ?? 'b'}-${i}`}
          href={entity.data.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {slice}
        </CaptionLink>
      )
    } else {
      segments.push(slice)
    }
    cursor = range.offset + range.length
  })
  if (cursor < text.length) {
    segments.push(text.slice(cursor))
  }
  return <>{segments}</>
}

function CaptionRichText({ raw }: { raw: CaptionRichTextData }) {
  const blocks = raw?.blocks ?? []
  const entityMap = raw?.entityMap ?? {}
  return (
    <>
      {blocks.map((block, i) => (
        <React.Fragment key={block.key || i}>
          {i > 0 && <br />}
          {renderCaptionBlock(block, entityMap)}
        </React.Fragment>
      ))}
    </>
  )
}

function hasCaptionRichText(
  raw: CaptionRichTextData | undefined | null
): raw is CaptionRichTextData {
  if (!raw?.blocks?.length) return false
  return raw.blocks.some((b) => (b.text ?? '').trim().length > 0)
}

type ImageBlockProps = {
  block: ContentBlock
  contentState: ContentState
}

export function ImageBlock(props: ImageBlockProps) {
  const { block, contentState } = props
  const entityKey = block.getEntityAt(0)

  const entity = contentState.getEntity(entityKey)
  const {
    desc,
    name,
    resized = {},
    resizedWebp = {},
    url,
    src,
    captionRichText,
  } = entity.getData()

  // Check if resized images exist, otherwise fallback to src
  const hasResizedImages = resized && Object.keys(resized).length > 0
  const imagesToUse = hasResizedImages ? resized : src ? { original: src } : {}
  const webpImagesToUse =
    resizedWebp && Object.keys(resizedWebp).length > 0 ? resizedWebp : {}

  const image = (
    <CustomImage
      images={imagesToUse}
      imagesWebP={webpImagesToUse}
      defaultImage={defaultImage}
      alt={name || desc}
      rwd={{
        mobile: '100vw',
        tablet: '608px',
        desktop: '640px',
        default: '100%',
      }}
      priority={true}
    />
  )

  const useRichCaption = hasCaptionRichText(captionRichText)

  return (
    <Figure>
      {url ? (
        <a href={url} target="_blank" rel="noopener noreferrer">
          {image}
        </a>
      ) : (
        image
      )}
      <FigureCaption>
        {useRichCaption ? (
          <CaptionRichText raw={captionRichText} />
        ) : url ? (
          <CaptionLink href={url} target="_blank" rel="noopener noreferrer">
            {desc}
          </CaptionLink>
        ) : (
          desc
        )}
      </FigureCaption>
    </Figure>
  )
}

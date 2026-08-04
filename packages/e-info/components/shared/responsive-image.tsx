import React, { useEffect, useState } from 'react'

type SizeMap = {
  original?: string
  w480?: string
  w800?: string
  w1200?: string
  w1600?: string
  w2400?: string
}

type Props = {
  resized?: SizeMap | null
  resizedWebp?: SizeMap | null
  alt: string
  sizes?: string
  defaultSrc: string
  priority?: boolean
  className?: string
}

const SRCSET_KEYS = ['w480', 'w800', 'w1200', 'w1600', 'w2400'] as const

function buildSrcSet(images?: SizeMap | null): string {
  if (!images) return ''
  return SRCSET_KEYS.flatMap((key) => {
    const url = images[key]
    if (!url) return []
    return [`${url} ${key.slice(1)}w`]
  }).join(', ')
}

function pickFallbackSrc(images?: SizeMap | null): string {
  if (!images) return ''
  return images.w1200 || images.w800 || images.w480 || images.original || ''
}

// Replaces @readr-media/react-image for cases where the source can change in
// place (e.g. tab switches) — that component keeps the loaded URL in internal
// state and never re-runs its effect when `images` change. This component stays
// stateless for the loaded URL itself; the only state it holds is whether the
// current source errored, so it can fall back to `defaultSrc` instead of a
// broken image, and that flag is reset whenever the source changes.
const ResponsiveImage = ({
  resized,
  resizedWebp,
  alt,
  sizes,
  defaultSrc,
  priority = false,
  className,
}: Props) => {
  const webpSrcSet = buildSrcSet(resizedWebp)
  const jpegSrcSet = buildSrcSet(resized)
  const fallbackSrc =
    pickFallbackSrc(resized) || pickFallbackSrc(resizedWebp) || defaultSrc

  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setHasError(false)
  }, [fallbackSrc])

  return (
    <picture style={{ display: 'contents' }}>
      {/* Drop the <source> candidates once loading fails so the <picture>
          source-selection algorithm falls through to the <img> below instead
          of re-matching (and re-failing on) the same webp/jpeg source. */}
      {!hasError && webpSrcSet && (
        <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />
      )}
      {!hasError && jpegSrcSet && <source srcSet={jpegSrcSet} sizes={sizes} />}
      <img
        src={hasError ? defaultSrc : fallbackSrc}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={className}
        onError={() => setHasError(true)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
        }}
      />
    </picture>
  )
}

export default ResponsiveImage

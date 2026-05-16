import CustomImage from '@readr-media/react-image'
import { DraftEntityInstance } from 'draft-js'
import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import defaultImage from '../assets/post-default.png'
import SlideShowLightBox from '../components/slideshow-lightbox'

const SlideShowDesktopSize = 960
const SpacingBetweenSlideImages = 12
const SlideShowRowHeight = 300
const DefaultMaxImagesPerRow = 3

const SlideShowBlockWrapper = styled.div`
  width: calc(100% + 36px);
  position: relative;
  background-color: ${({ theme }) => theme.colors.grayscale[95]};
  margin: 32px -18px 0;
  padding: 18px 28px;

  ${({ theme }) => theme.breakpoint.xl} {
    width: ${(props) =>
      props.widthPercentage ? `${props.widthPercentage}%` : '100%'};
    ${(props) =>
      props.widthPercentage ? 'margin-left: auto; margin-right: auto;' : ''}
    background-color: transparent;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: ${SpacingBetweenSlideImages}px;
    max-height: ${(props) => (props.expandSlideShow ? 'none' : '960px')};
    overflow: ${(props) => (props.expandSlideShow ? 'visible' : 'hidden')};
    margin-bottom: ${(props) => (props.expandSlideShow ? '32px' : '16px')};
  }
`

const SlideShowRow = styled.div`
  display: contents;

  ${({ theme }) => theme.breakpoint.xl} {
    display: flex;
    align-items: stretch;
    gap: ${SpacingBetweenSlideImages}px;
  }
`

const SlideShowImage = styled.figure`
  width: 100%;
  aspect-ratio: ${(props) => (props.isSingle ? 'unset' : '4/3')};
  margin: 0;

  & + .slideshow-image {
    margin-top: ${SpacingBetweenSlideImages}px;
  }

  ${({ theme }) => theme.breakpoint.xl} {
    aspect-ratio: unset;
    max-height: ${(props) => (props.isSingle ? 'none' : `${SlideShowRowHeight}px`)};
    flex-grow: ${(props) => (props.isSingle ? 0 : props.aspectRatio || 1)};
    flex-shrink: ${(props) => (props.isSingle ? 0 : 1)};
    flex-basis: ${(props) =>
      props.isSingle
        ? 'auto'
        : `${Math.round((props.aspectRatio || 1) * SlideShowRowHeight)}px`};
    overflow: ${(props) => (props.isSingle ? 'visible' : 'hidden')};
    ${(props) => props.isSingle ? 'margin: 0 auto;' : ''}

    img {
      width: ${(props) => (props.isSingle ? 'auto' : '100%')};
      max-width: 100%;
      height: ${(props) => (props.isSingle ? 'auto' : '100%')};
      object-fit: contain;
    }

    &:hover {
      cursor: ${(props) => (props.lightboxEnabled ? 'pointer' : 'default')};
      filter: ${(props) =>
        props.lightboxEnabled ? 'brightness(0.85)' : 'none'};
      transition: ${(props) => (props.lightboxEnabled ? '0.3s' : 'none')};
    }

    & + .slideshow-image {
      margin-top: unset;
    }
  }
`

const FigCaption = styled.figcaption`
  font-weight: 400;
  line-height: 23px;
  color: #000928;
  opacity: 0.5;
  ${({ theme }) => theme.fontSize.xs};
  padding: 8px 20px 12px 20px;
  text-align: center;

  ${({ theme }) => theme.breakpoint.md} {
    ${({ theme }) => theme.fontSize.sm};
    text-align: left;
  }

  ${({ theme }) => theme.breakpoint.xl} {
    display: none;
  }
`

const GradientMask = styled.div`
  display: none;

  ${({ theme }) => theme.breakpoint.xl} {
    cursor: pointer;
    display: block;
    position: absolute;
    width: 100%;
    height: ${SlideShowDesktopSize}px;
    bottom: 0;
    left: 0;
    background: linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0) 648px,
      rgba(255, 255, 255, 1) 960px
    );
  }
`

const ExpandText = styled.div`
  display: none;

  ${({ theme }) => theme.breakpoint.xl} {
    display: block;
    font-style: normal;
    font-weight: 700;
    ${({ theme }) => theme.fontSize.md};
    line-height: 18px;
    letter-spacing: 0.03em;
    color: #000928;
    text-align: center;
    cursor: pointer;
    position: relative;
    margin-bottom: 48px;
    transition: all 0.2s ease;

    &:hover::after,
    &:active::after {
      bottom: -30px;
      transition: all 0.2s;
    }

    &::after {
      content: '▼';
      position: absolute;
      bottom: -26px;
      left: 50%;
      transform: translate(-50%, 0%);
      font-size: 12px;
      color: #000928;
    }
  }
`

const OverallCaption = styled.figcaption`
  font-weight: 400;
  line-height: 1.6;
  color: #000928;
  opacity: 0.5;
  ${({ theme }) => theme.fontSize.xs};
  padding: 8px 20px 20px 20px;
  text-align: center;

  ${({ theme }) => theme.breakpoint.md} {
    ${({ theme }) => theme.fontSize.sm};
    text-align: left;
    padding: 8px 0 20px 0;
  }

  ${({ theme }) => theme.breakpoint.xl} {
    ${({ theme }) => theme.fontSize.sm};
    text-align: left;
    padding: 8px 0 20px 0;
  }
`

// support old version of slideshow without delay propertiy
const Figure = styled.figure`
  position: relative;
  margin-block: unset;
  margin-inline: unset;
  margin: 0 10px;
`

const Image = styled.img`
  width: 100%;
`

export function SlideshowBlock(entity: DraftEntityInstance) {
  const images = entity.getData()
  return (
    <Figure>
      <Image
        src={images?.[0]?.resized?.original}
        alt={images?.[0]?.name}
        onError={(e) => (e.currentTarget.src = images?.[0]?.imageFile?.url)}
      />
    </Figure>
  )
}

// 202206 latest version of slideshow, support delay property
export function SlideshowBlockV2(entity: DraftEntityInstance) {
  const {
    images,
    overallCaption,
    widthPercentage,
    maxImagesPerRow,
    lightboxEnabled = true,
  } = entity.getData()
  const [expandSlideShow, setExpandSlideShow] = useState(false)
  const [showLightBox, setShowLightBox] = useState(false)
  const [focusImageIndex, setFocusImageIndex] = useState(0)
  const [aspectRatios, setAspectRatios] = useState<Record<string, number>>({})

  const imagesRefs = useRef(Array(images.length).fill(null))

  useEffect(() => {
    const focusedImageRef = imagesRefs?.current[focusImageIndex]

    if (focusedImageRef) {
      focusedImageRef?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }, [focusImageIndex])

  // Load images to get natural dimensions for justified layout
  useEffect(() => {
    images.forEach((image) => {
      const src =
        image.resized?.original ||
        image.resized?.w800 ||
        image.imageFile?.url
      if (!src) return

      const img = new window.Image()
      img.onload = () => {
        setAspectRatios((prev) => ({
          ...prev,
          [image.id]: img.naturalWidth / img.naturalHeight,
        }))
      }
      img.src = src
    })
  }, [images])

  const shouldMaskSlideShow = Boolean(images.length > 9 && !expandSlideShow)

  const renderImage = (image, index) => {
    const { id, resized, desc, name } = image
    const ratio = aspectRatios[id] || 1
    return (
      <SlideShowImage
        className="slideshow-image"
        key={id}
        aspectRatio={ratio}
        isSingle={images.length === 1}
        lightboxEnabled={lightboxEnabled}
        onClick={() => {
          if (!lightboxEnabled) return
          setShowLightBox(!showLightBox)
          setFocusImageIndex(index)
        }}
      >
        <CustomImage
          images={resized}
          defaultImage={defaultImage}
          alt={name}
          rwd={{
            mobile: '100vw',
            tablet: '608px',
            desktop: '960px',
            default: '100%',
          }}
          priority={true}
        />
        {desc && <FigCaption>{desc}</FigCaption>}
      </SlideShowImage>
    )
  }

  // Split images into rows based on maxImagesPerRow
  const perRow = maxImagesPerRow || DefaultMaxImagesPerRow
  const rows = []
  for (let i = 0; i < images.length; i += perRow) {
    rows.push(images.slice(i, i + perRow))
  }

  return (
    <>
      <SlideShowBlockWrapper
        onClick={
          shouldMaskSlideShow
            ? () => setExpandSlideShow(!expandSlideShow)
            : undefined
        }
        expandSlideShow={expandSlideShow}
        widthPercentage={widthPercentage}
      >
        {rows.map((rowImages, rowIndex) => (
          <SlideShowRow key={rowIndex}>
            {rowImages.map((image, imgIndex) =>
              renderImage(image, rowIndex * perRow + imgIndex)
            )}
          </SlideShowRow>
        ))}
        {shouldMaskSlideShow && <GradientMask />}
      </SlideShowBlockWrapper>

      {shouldMaskSlideShow && (
        <ExpandText
          className="slideshow-expand-text"
          onClick={() => setExpandSlideShow(!expandSlideShow)}
        >
          展開所有圖片
        </ExpandText>
      )}
      {overallCaption && (
        <OverallCaption>{overallCaption}</OverallCaption>
      )}
      {showLightBox && lightboxEnabled && (
        <SlideShowLightBox
          focusImageIndex={focusImageIndex}
          images={images}
          setShowLightBox={setShowLightBox}
          setFocusImageIndex={setFocusImageIndex}
          imagesRefs={imagesRefs}
        />
      )}
    </>
  )
}

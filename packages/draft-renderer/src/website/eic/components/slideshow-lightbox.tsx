import CustomImage from '@readr-media/react-image'
import React from 'react'
import styled from 'styled-components'

import SlideShowSideBar from './slideshow-sidebar'

// Root-relative path served by the consuming app's /public directory — see
// image-block.tsx for why the bundled asset import 404s in production.
const defaultImage = '/post-default.png'

const LightBoxWrapper = styled.div`
  display: none;

  ${({ theme }) => theme.breakpoint.xl} {
    background: rgba(36, 36, 36, 0.7);
    width: 100%;
    height: 100vh;
    position: fixed;
    top: 0;
    left: 0;
    color: white;
    padding: 0 72px 0 48px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    z-index: 9999;
  }
`

const FocusImageWrapper = styled.div`
  font-weight: 400;
  ${({ theme }) => theme.fontSize.sm};
  line-height: 23px;
  text-align: center;
  color: #ffffff;
`

const FocusImage = styled.figure`
  max-width: 900px;
  max-height: 60vh;
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    max-width: 100%;
    max-height: 60vh;
    object-fit: contain;
  }

  ${({ theme }) => theme.breakpoint.xxl} {
    max-width: 960px;
  }
`

const FocusInfo = styled.div`
  .focus-desc {
    max-height: 46px;
    overflow: hidden;
    word-break: break-word;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    opacity: 0.87;
    margin-bottom: 12px;
    text-align: left;
  }

  .focus-number {
    opacity: 0.5;
    margin-top: 12px;
  }
`

const CloseButtonWrapper = styled.div`
  height: 60vh;
  width: 64px;
  position: relative;
`

const CloseButton = styled.div`
  width: 64px;
  height: 64px;
  margin: auto;
  cursor: pointer;
  position: absolute;
  top: -64px;
  border-radius: 50%;

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 24px;
    height: 2px;
    background-color: #ffffff;
  }

  &::before {
    transform: translate(-50%, -50%) rotate(45deg);
  }

  &::after {
    transform: translate(-50%, -50%) rotate(-45deg);
  }
`

export default function SlideshowLightBox({
  focusImageIndex,
  images,
  setShowLightBox,
  setFocusImageIndex,
  imagesRefs,
}) {
  const focusImageDesc = `${images[focusImageIndex].desc}`
  const focusNumber = `${focusImageIndex + 1} / ${images?.length}`

  return (
    <LightBoxWrapper>
      <SlideShowSideBar
        focusImageIndex={focusImageIndex}
        images={images}
        setFocusImageIndex={setFocusImageIndex}
        imagesRefs={imagesRefs}
      />

      <FocusImageWrapper>
        <FocusImage>
          <CustomImage
            images={images[focusImageIndex].resized}
            defaultImage={defaultImage}
            alt={images[focusImageIndex].name}
            objectFit={'contain'}
            rwd={{
              desktop: '960px',
              default: '100%',
            }}
            priority={true}
          />
        </FocusImage>
        <FocusInfo>
          <p className="focus-desc">{focusImageDesc}</p>
          <p className="focus-number">{focusNumber}</p>
        </FocusInfo>
      </FocusImageWrapper>

      <CloseButtonWrapper>
        <CloseButton
          onClick={(e) => {
            e.preventDefault()
            setShowLightBox(false)
          }}
        />
      </CloseButtonWrapper>
    </LightBoxWrapper>
  )
}

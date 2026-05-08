import NextLink from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import styled, { css, keyframes } from 'styled-components'

import { SHARE_URL } from '~/constants/social'
import { useAuth } from '~/hooks/useAuth'
import {
  addFavorite,
  checkPostFavorited,
  removeFavorite,
} from '~/lib/graphql/member'
import IconBookmark from '~/public/icons/bookmark.svg'
import IconBookmarkFilled from '~/public/icons/bookmark-filled.svg'
import IconFacebook from '~/public/icons/facebook.svg'
import IconLine from '~/public/icons/line.svg'
import IconLink from '~/public/icons/link.svg'
import IconX from '~/public/icons/x.svg'
import * as gtag from '~/utils/gtag'

const MediaLinkWrapper = styled.ul<{ className: string }>`
  display: flex;
  align-items: center;
  gap: 20px;

  a,
  button {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0;
    border: none;
    background: transparent;
    cursor: pointer;
  }

  svg {
    width: 20px;
    height: 20px;
  }
`

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`

const BookmarkButton = styled.button<{
  $isActive: boolean
  $isLoading: boolean
}>`
  svg path {
    fill: ${({ $isActive }) => ($isActive ? '#2d7a4f' : 'black')};
  }

  ${({ $isLoading }) =>
    $isLoading &&
    css`
      svg {
        animation: ${spin} 0.8s linear infinite;
        opacity: 0.5;
      }
    `}
`

const CopyLinkItem = styled.li`
  position: relative;
`

const CopiedToast = styled.span`
  position: absolute;
  bottom: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 8px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;
`

type ExternalLinkItem = {
  name: string
  href: string
  svgIcon: any
  alt: string
  click: () => void
}

type MediaLinkListProps = {
  className?: string
  postId?: string
  hideBookmark?: boolean
}

export default function MediaLinkList({
  className = 'media-link-list',
  postId,
  hideBookmark = false,
}: MediaLinkListProps): JSX.Element {
  const [href, setHref] = useState('')
  const [isFavorited, setIsFavorited] = useState(false)
  const [favoriteId, setFavoriteId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const { member, firebaseUser, loading: authLoading } = useAuth()

  useEffect(() => {
    setHref(() => window.location.href)
  }, [])

  // Check if post is already favorited when member and postId are available
  useEffect(() => {
    const checkFavorite = async () => {
      if (member?.id && postId && firebaseUser?.uid) {
        const existingFavoriteId = await checkPostFavorited(
          member.id,
          postId,
          firebaseUser.uid
        )
        if (existingFavoriteId) {
          setIsFavorited(true)
          setFavoriteId(existingFavoriteId)
        } else {
          setIsFavorited(false)
          setFavoriteId(null)
        }
      } else {
        setIsFavorited(false)
        setFavoriteId(null)
      }
    }
    checkFavorite()
  }, [member?.id, postId, firebaseUser?.uid])

  const externalLinks: ExternalLinkItem[] = [
    {
      name: 'Facebook',
      href: SHARE_URL.facebook(href),
      svgIcon: IconFacebook,
      alt: '分享至 Facebook',
      click: () => gtag.sendEvent('post', 'click', 'post-share-fb'),
    },
    {
      name: 'X',
      href: SHARE_URL.x(href),
      svgIcon: IconX,
      alt: '分享至 X',
      click: () => gtag.sendEvent('post', 'click', 'post-share-twitter'),
    },
    {
      name: 'Line',
      href: SHARE_URL.line(href),
      svgIcon: IconLine,
      alt: '分享至 LINE',
      click: () => gtag.sendEvent('post', 'click', 'post-share-line'),
    },
  ]

  const handleBookmarkClick = useCallback(async () => {
    gtag.sendEvent('post', 'click', 'post-bookmark')

    // Wait if auth state is still loading
    if (authLoading) return

    // Check if user is logged in
    if (!member) {
      alert('請先登入才能收藏文章')
      return
    }

    // Check if postId is available
    if (!postId) {
      console.error('postId is required for bookmark functionality')
      return
    }

    if (isLoading) return
    setIsLoading(true)

    try {
      if (isFavorited && favoriteId) {
        // Remove from favorites
        const success = await removeFavorite(favoriteId, firebaseUser!.uid)
        if (success) {
          setIsFavorited(false)
          setFavoriteId(null)
          gtag.sendMemberEvent('unbookmark', postId)
        }
      } else {
        // Add to favorites
        const newFavoriteId = await addFavorite(
          member.id,
          postId,
          firebaseUser!.uid
        )
        if (newFavoriteId) {
          setIsFavorited(true)
          setFavoriteId(newFavoriteId)
          gtag.sendMemberEvent('bookmark', postId)
        }
      }
    } catch (error) {
      console.error('Bookmark operation failed:', error)
    } finally {
      setIsLoading(false)
    }
  }, [
    member,
    firebaseUser,
    postId,
    isFavorited,
    favoriteId,
    isLoading,
    authLoading,
  ])

  const handleCopyClick = useCallback(async () => {
    gtag.sendEvent('post', 'click', 'post-share-copy-link')
    try {
      await navigator.clipboard.writeText(href || window.location.href)
      setIsCopied(true)
      window.setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      console.error('Copy link failed:', error)
    }
  }, [href])

  return (
    <MediaLinkWrapper className={className}>
      {!hideBookmark && (
        <li key="Bookmark">
          <BookmarkButton
            type="button"
            aria-label={isFavorited ? '取消收藏' : '加入收藏'}
            onClick={handleBookmarkClick}
            $isActive={isFavorited}
            $isLoading={isLoading || authLoading}
            disabled={isLoading || authLoading}
          >
            {isFavorited ? <IconBookmarkFilled /> : <IconBookmark />}
          </BookmarkButton>
        </li>
      )}
      {externalLinks.map((item) => {
        return (
          <li key={item.name} aria-label={item.alt} onClick={item.click}>
            <NextLink
              href={item.href}
              target="_blank"
              rel="noopener noreferrer external nofollow"
            >
              <item.svgIcon />
            </NextLink>
          </li>
        )
      })}
      <CopyLinkItem key="CopyLink">
        <button
          type="button"
          aria-label={isCopied ? '已複製連結' : '複製連結'}
          onClick={handleCopyClick}
        >
          <IconLink />
        </button>
        {isCopied && <CopiedToast role="status">已複製連結</CopiedToast>}
      </CopyLinkItem>
    </MediaLinkWrapper>
  )
}

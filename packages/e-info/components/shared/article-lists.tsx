import styled, { css, useTheme } from 'styled-components'

import ArticleListCard from '~/components/shared/article-list-card'
import type { ArticleCard } from '~/types/component'
import * as gtag from '~/utils/gtag'

const shareStyle = css`
  width: 100%;
  ${({ theme }) => theme.breakpoint.sm} {
    width: calc((100% - 40px) / 2);
  }
  ${({ theme }) => theme.breakpoint.xl} {
    width: calc((100% - 44px) / 2);
  }
`

const Item = styled.li`
  margin: 0 0 16px;
  list-style: none;
  ${({ theme }) => theme.breakpoint.sm} {
    margin: 0 0 47px;
  }
  ${({ theme }) => theme.breakpoint.xl} {
    margin: 0 0 44px;
  }
  ${shareStyle}
`

const ItemList = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  width: 100%;
  margin-top: 20px;
`

type ArticleListsProps = {
  posts?: ArticleCard[]
  AdPageKey?: string
  defaultImage?: string
}

export default function ArticleLists({
  posts,
  defaultImage,
}: ArticleListsProps): JSX.Element {
  const theme = useTheme()
  const items = posts?.map((article) => {
    return (
      <Item key={article.id}>
        <ArticleListCard
          {...article}
          isReport={false}
          shouldHighlightReport={false}
          shouldReverseInMobile={true}
          sizes={`(max-width: ${theme.mediaSize.sm - 1}px) 30vw, (max-width: ${
            theme.mediaSize.xl - 1
          }px) 50vw, 256px`}
          onClick={() =>
            gtag.sendEvent('listing', 'click', `listing-${article.title}`)
          }
          defaultImage={article.defaultImage || defaultImage}
        />
      </Item>
    )
  })

  return <ItemList>{items}</ItemList>
}

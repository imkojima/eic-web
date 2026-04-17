// 這裡管理固定數值

import type { NavigationCategory } from '~/types/component'

const SITE_TITLE = '環境資訊中心'
const DEFAULT_POST_IMAGE_PATH = '/post-default.png'
const DEFAULT_NEWS_IMAGE_PATH = '/news-default.jpg'
const DEFAULT_EVENT_IMAGE_PATH = '/event-default.jpg'
const DEFAULT_NEWSLETTER_IMAGE_PATH = '/newsletter-default.png'
const DEFAULT_CATEGORY: NavigationCategory = {
  id: 'all',
  title: '不分類',
  slug: 'all',
}

const POST_STYLES: string[] = ['default', 'editor']
export {
  DEFAULT_CATEGORY,
  DEFAULT_EVENT_IMAGE_PATH,
  DEFAULT_NEWS_IMAGE_PATH,
  DEFAULT_NEWSLETTER_IMAGE_PATH,
  DEFAULT_POST_IMAGE_PATH,
  POST_STYLES,
  SITE_TITLE,
}

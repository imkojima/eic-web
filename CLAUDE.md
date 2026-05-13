# EIC Web Project Documentation

## Project Overview

**Project Name**: EIC Web (Environment Info Center Website)
**Codename**: Sachiel
**Tech Stack**: Lerna Monorepo + Next.js + TypeScript + Apollo GraphQL
**Node Version**: >= 18.18.0

## Project Structure

```
eic-web/
├── packages/
│   ├── e-info/                    # Main website application
│   │   ├── components/            # React components
│   │   │   ├── node/             # Post-related components
│   │   │   │   ├── article-type/ # Different article types
│   │   │   │   ├── post-content.tsx
│   │   │   │   ├── post-credit.tsx
│   │   │   │   ├── post-title.tsx
│   │   │   │   ├── related-post.tsx
│   │   │   │   └── tag.tsx
│   │   │   ├── layout/           # Layout components
│   │   │   ├── shared/           # Shared components
│   │   │   ├── index/            # Homepage components
│   │   │   ├── about/            # About page components
│   │   │   └── ad/               # Advertisement components
│   │   ├── pages/                # Next.js page routes
│   │   │   ├── _app.tsx          # App entry
│   │   │   ├── index.tsx         # Homepage
│   │   │   ├── post/[id].tsx     # Post page
│   │   │   ├── category/[slug].tsx
│   │   │   ├── author/[id].tsx
│   │   │   ├── tag/[name].tsx
│   │   │   ├── about.tsx
│   │   │   └── api/              # API routes
│   │   ├── graphql/              # GraphQL queries & fragments
│   │   │   ├── query/
│   │   │   │   └── post.ts       # Post queries
│   │   │   └── fragments/
│   │   │       ├── post.ts
│   │   │       ├── author.ts
│   │   │       └── resized-images.ts
│   │   ├── constants/            # Constants
│   │   │   ├── config.ts         # API endpoints config (GraphQL, Homepage, Header, PopularSearch)
│   │   │   ├── constant.ts       # Common constants (site title, default images, post styles)
│   │   │   ├── environment-variables.ts # Build-time env vars (GA, GTM, site URL)
│   │   │   ├── layout.ts         # Layout & pagination constants (MAX_CONTENT_WIDTH, POSTS_PER_PAGE, cache/timeout)
│   │   │   ├── social.ts         # Social media URLs & share URL patterns
│   │   │   ├── auth.ts           # Auth-related constants (location options, validation)
│   │   │   └── redirects.ts      # Page rewrite mappings
│   │   ├── utils/                # Utility functions
│   │   ├── styles/               # Styles
│   │   │   └── theme/            # styled-components theme
│   │   ├── hooks/                # React Hooks
│   │   ├── types/                # TypeScript type definitions
│   │   └── contexts/             # React Context
│   └── draft-renderer/           # Draft.js content renderer
│       └── (Separate package, migrated to @eic-web/draft-renderer 1.4.4)
├── .husky/                       # Git hooks
├── package.json                  # Root package.json (yarn workspaces)
└── cloudbuild.yaml              # GCP Cloud Build config
```

## Key Technical Details

### API Environment Configuration

All API endpoints are centrally managed in `packages/e-info/constants/config.ts`:

| Endpoint | Variable | Description |
|----------|----------|-------------|
| GraphQL API | `API_ENDPOINT` | Main CMS GraphQL endpoint |
| Homepage API | `HOMEPAGE_API_ENDPOINT` | JSON API for homepage data (with GraphQL fallback) |
| Header API | `HEADER_API_ENDPOINT` | JSON API for header/footer data (with GraphQL fallback) |
| Popular Search | `POPULAR_SEARCH_ENDPOINT` | GCS JSON for GA4 popular search keywords |
| Preview API | `PREVIEW_API_ENDPOINT` | Preview mode GraphQL endpoint |

Environment variable `NEXT_PUBLIC_ENV` controls which environment to use (local/dev/prod).

### Constants Architecture

```
constants/
├── config.ts              # Runtime env vars & API endpoints (per-environment switch)
├── constant.ts            # Fixed values (SITE_TITLE, default images, post styles)
├── environment-variables.ts # Build-time env vars (SITE_URL, GA_TRACKING_ID, GTM_ID)
├── layout.ts              # Layout & data constants:
│                          #   MAX_CONTENT_WIDTH ('1200px') - used across 27+ files
│                          #   POSTS_PER_PAGE (12), POSTS_PER_CATEGORY (3)
│                          #   CACHE_TTL_MS, API_TIMEOUT_MS, HEALTH_CHECK_TIMEOUT_MS
├── social.ts              # Social media constants:
│                          #   SOCIAL_LINKS { facebook, x, instagram, line }
│                          #   SHARE_URL { facebook(url), x(url), line(url) }
├── auth.ts                # Location options, validation rules
└── redirects.ts           # Page rewrite mappings
```

**Usage Guidelines**:
- **Layout constants**: Use `MAX_CONTENT_WIDTH` in styled-components instead of hardcoded `1200px`
- **Pagination**: Import `POSTS_PER_PAGE` / `POSTS_PER_CATEGORY` from `~/constants/layout` instead of defining locally
- **Social URLs**: Use `SOCIAL_LINKS` for profile links, `SHARE_URL` for share buttons
- **API endpoints**: All endpoints go through `config.ts` environment switch, never hardcode in utility files

### Apollo Client Configuration

Apollo Client is initialized in `packages/e-info/apollo-client.ts` for the Main CMS API.

**Important**: Migrated from `uri` parameter to `HttpLink` to avoid Apollo Client v4 deprecation warning.

```typescript
// Correct Apollo Client configuration
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client'

const client = new ApolloClient({
  link: new HttpLink({ uri: API_ENDPOINT }),
  cache: new InMemoryCache(),
})
```

### GraphQL Schema

#### Post Data Structure

```typescript
type Post {
  id: string
  title: string
  style: string
  publishTime: string
  heroImage: {
    resized: {
      original: string
      w480: string
      w800: string
      w1200: string
      w1600: string
      w2400: string
    }
    resizedWebp: { ... }
  }
  ogImage: { ... }
  content: string          // Draft.js JSON string — currently used by PostContent
  contentApiData: JSON     // New API format (array) — queried but not yet rendered (DraftRenderer incompatible)
  brief: JSON              // Draft.js brief — currently used
  briefApiData: JSON       // New API format brief — queried but not yet rendered
  citations: string        // HTML string for references
  tags: [Tag]
  category: Category
  section: Section
  author1, author2, author3: Author
  relatedPosts: [Post]
  // ... more fields
}
```

#### Category Data Structure

```typescript
type Category {
  id: ID!
  slug: String              // URL-friendly identifier (e.g., "ecomid")
  name: String              // Display name (e.g., "環中")
  sortOrder: Int            // Display order
  heroImage: Photo          // Hero image for category
  heroImageCaption: String  // Image caption
  posts: [Post]             // Related posts (ordered by publishTime)
  postsCount: Int           // Number of posts
  featuredPosts: [Post]           // Featured posts (ordered by add time)
  featuredPostsInInputOrder: [Post] // Featured posts (ordered by CMS input order)
  section: Section          // Parent section
  classifies: [Classify]    // Classifications
  classifiesCount: Int
  createdAt: DateTime
  updatedAt: DateTime
  createdBy: User
  updatedBy: User
}
```

**Example Query**:
```graphql
query {
  categories(orderBy: { sortOrder: asc }) {
    id
    slug
    name
    postsCount
    # Featured posts first (in CMS input order), then regular posts
    featuredPostsInInputOrder {
      id
      title
      publishTime
    }
    posts(take: 10) {
      id
      title
      publishTime
    }
  }
}
```

#### Topic Data Structure

```typescript
type Topic {
  id: ID!
  title: String             // Topic title
  status: String            // "published", "draft", etc.
  content: String           // Topic description/summary
  authorInfo: String        // Author information
  heroImage: Photo          // Hero image for topic
  posts: [Post]             // Related articles
  postsCount: Int           // Number of articles
  tags: [Tag]               // Related tags
  tagsCount: Int            // Number of tags
  isPinned: Boolean         // Whether pinned to top
  sortOrder: Int            // Display order (used for homepage sorting)
  createdAt: DateTime
  updatedAt: DateTime
  createdBy: User
  updatedBy: User
}
```

**Example Query**:
```graphql
query {
  # Homepage uses sortOrder for ordering
  topics(orderBy: { sortOrder: asc }) {
    id
    title
    status
    content
    heroImage {
      resized {
        original
        w480
        w800
        w1200
      }
    }
    postsCount
    posts(take: 24) {
      id
      title
      publishTime
      heroImage {
        resized {
          original
          w480
        }
      }
    }
    tags {
      id
      name
    }
    isPinned
    sortOrder
  }
}
```

**Dev Environment Test Data**:
- Topic ID `3`: "直擊阿聯氣候新時代" (4 posts, isPinned: true)
- Topic ID `2`: "測試用專題" (8 posts, 2 tags)

#### Tag Data Structure

```typescript
type Tag {
  id: ID!
  name: String              // Tag name
  brief: String             // Tag description
  heroImage: Photo          // Tag hero image
  isFeatured: Boolean       // Whether featured tag
  sortOrder: Int            // Display order
  posts: [Post]             // Related posts
  postsCount: Int           // Number of posts
  topics: [Topic]           // Related topics
  topicsCount: Int          // Number of topics
  createdAt: DateTime
  updatedAt: DateTime
  createdBy: User
  updatedBy: User
}
```

**Example Query**:
```graphql
query {
  tags(where: { isFeatured: { equals: true } }) {
    id
    name
    brief
    postsCount
    topicsCount
  }
}
```

#### Section Data Structure

```typescript
type Section {
  id: ID!
  slug: String              // URL-friendly identifier (e.g., "latestnews")
  name: String              // Display name (e.g., "時事新聞")
  categories: [Category]    // Child categories
  categoriesCount: Int      // Number of categories
  createdAt: DateTime
  updatedAt: DateTime
  createdBy: User
  updatedBy: User
}
```

**Example Query**:
```graphql
query {
  sections {
    id
    slug
    name
    categoriesCount
    categories {
      id
      slug
      name
      postsCount
    }
  }
}
```

**Dev Environment Sections**:
| ID | Slug | Name | Categories |
|---|---|---|---|
| 1 | news | 時事新聞 | 9 |
| 2 | column | 專欄 | 54 |
| 3 | supplement | 副刊 | 16 |
| 4 | opinion | 評論 | 3 |
| 5 | greenconsumption | 綠色消費 | 0 |
| 6 | event | 活動 | 0 |

#### ResizedImages Field Names

Image sizes use `w480`, `w800`, `w1200`, `w1600`, `w2400`, **not** `small`, `medium`, `large`.

### Draft.js Content Rendering

The project uses a custom draft-renderer package (`@eic-web/draft-renderer` v1.4.4).

**Important Changes**:
- The CMS exposes a new `contentApiData` / `briefApiData` array format alongside the legacy Draft.js `content` / `brief` fields
- **Current rendering still uses the legacy `content` / `brief` fields** because `DraftRenderer` only accepts Draft.js raw content state. The new API fields are queried in the fragment but not rendered (see `post-content.tsx` comment around line 301)
- Image rendering uses `SharedImage` component with fallback mechanism:
  ```typescript
  images={resized} or src={image.url}
  ```

### Styled Components Theme

Theme is defined in `packages/e-info/styles/theme/`, including:
- Breakpoints: `sm`, `md`, `lg`, `xl`
- Color system
- Typography

### GA4 Analytics Tracking

GA4 tracking utilities are defined in `packages/e-info/utils/gtag.ts`:

```typescript
// Basic event tracking
sendEvent(category, action, label?)

// Event with custom dimensions (uses gtag directly)
sendEventWithDimensions(category, action, label?, dimensions?)

// Article pageview with category/section dimensions
sendArticlePageview(path, { articleId, articleTitle, articleCategory, articleSection, articleTags })

// Conversion tracking
sendConversion('newsletter_subscribe' | 'donation_complete' | 'share_complete' | 'external_link_click', value?)

// Member events
sendMemberEvent('login' | 'register' | 'logout' | 'bookmark' | 'unbookmark', label?)

// Reading progress (25%, 50%, 75%, 100%)
sendReadingProgress(progress, articleId?, articleCategory?)

// Outbound link clicks
sendOutboundClick(url, linkText?)
```

**Custom Hooks for Tracking**:
- `useReadingProgress` - Tracks scroll depth milestones (25/50/75/100%) on article pages
- `useOutboundLinkTracking` - Tracks clicks on external links within a container

**Usage in Article Page** (`pages/node/[id].tsx`):
```typescript
// Article pageview with dimensions
useEffect(() => {
  if (postData?.id) {
    gtag.sendArticlePageview(router.asPath, {
      articleId: postData.id,
      articleTitle: postData.title,
      articleCategory: postData.category?.name,
      articleSection: postData.section?.name,
      articleTags: tags,
    })
  }
}, [postData?.id, router.asPath])
```

## Recent Important Changes (2025-10-13)

### 1. Post Layout Refactoring

**Commit**: `954c5be` - Refactor post layout and fix Apollo Client deprecation

**Changes**:
- Moved `RelatedPosts` to the same column as `PostContent` (not in Aside)
- Redesigned `RelatedPosts` as a responsive card grid:
  - Mobile: 1 column
  - Tablet (md): 2 columns
  - Desktop (xl): 3 columns
- Removed dependency on `@readr-media/react-component`'s `RelatedReport`
- Updated text: "相關報導" → "相關文章", "最新報導" → "最新文章"

**Files**:
- `packages/e-info/components/post/article-type/news.tsx`
- `packages/e-info/components/post/related-post.tsx`

### 2. Tags Moved to PostCredit

**Commit**: `954c5be` (same as above)

**Changes**:
- Moved `<PostTag>` and media links from `PostContent` to `PostCredit`
- Added `TagSection` styled component below author information
- Removed `TagGroup` and `DesktopMediaLink` styled components

**Files**:
- `packages/e-info/components/post/post-credit.tsx`
- `packages/e-info/components/post/post-content.tsx`

### 3. Apollo Client Deprecation Fix

**Commit**: `954c5be` (same as above)

**Changes**:
- Changed from `uri: <url>` to `link: new HttpLink({ uri: <url> })`
- Fixed Apollo Client v4 deprecation warning

**Files**:
- `packages/e-info/apollo-client.ts`
- `packages/e-info/editools-apollo-client.ts`

### 4. Citations Styling Update

**Commit**: `445728b` - Update citation section styling and render HTML content

**Changes**:
- Changed title to green (#2d7a4f) `<h3>` tag
- Removed purple background (#f5f0ff) and dark blue title background (#0b2163)
- Removed center alignment and padding
- Added list styles (ul/li) and link styles
- Used `dangerouslySetInnerHTML` to render HTML content

**Important**: Citations field is an HTML string containing complete `<h3>`, `<ul>`, `<li>`, `<a>` tags.

**Files**:
- `packages/e-info/components/post/post-content.tsx`

**Style Example**:
```css
h3 {
  color: #2d7a4f;
  font-size: 20px (mobile) / 24px (desktop);
  font-weight: 700;
}

.content a {
  color: #2d7a4f;
  text-decoration: underline;
}

.content li {
  font-size: 16px (mobile) / 18px (desktop);
  line-height: 1.8;
}
```

### 5. Image Rendering Fix

**Commit**: `3fecc02` - Fix image rendering - fallback to src when resized images unavailable

**Changes**:
- When `resized` or `resizedWebp` are unavailable, fallback to `image.url`
- Use `SharedImage`'s `src` prop as fallback

**Files**:
- `packages/e-info/components/post/post-content.tsx`

### 6. Linting Fixes

**Commit**: `4475ef4` - Fix linting errors - prettier formatting and import sorting

**Changes**:
- Fixed prettier formatting errors (removed extra blank lines)
- Fixed import sorting (simple-import-sort rules)

## Recent Important Changes (2026-02-04)

### 7. GA4 Analytics Enhancements

**Commit**: `6495f6d` - feat: add GA4 tracking enhancements and cleanup dead code

**Changes**:
- Added article category/section dimension tracking for pageviews
- Added conversion tracking for newsletter subscription and donation
- Added member event tracking (login, register, logout)
- Added reading progress tracking (25/50/75/100%)
- Added outbound link click tracking
- New hooks: `useReadingProgress`, `useOutboundLinkTracking`

**Files**:
- `packages/e-info/utils/gtag.ts` - Extended with new tracking functions
- `packages/e-info/hooks/useReadingProgress.ts` - New hook
- `packages/e-info/hooks/useOutboundLinkTracking.ts` - New hook
- `packages/e-info/pages/node/[id].tsx` - Article pageview tracking
- `packages/e-info/components/shared/newsletter-modal.tsx` - Newsletter subscription conversion
- `packages/e-info/components/shared/donation-modal.tsx` - Donation conversion
- `packages/e-info/pages/auth/login-result.tsx` - Login tracking
- `packages/e-info/pages/auth/register-result.tsx` - Register tracking
- `packages/e-info/contexts/auth-context.tsx` - Logout tracking

### 8. Dead Code Cleanup

**Commits**: `6495f6d`, `b5eefec`

**Removed Files**:
- `packages/e-info/editools-apollo-client.ts` - Unused Editools API client
- `packages/e-info/pages/api/google-sheets/` - Unused Google Sheets API routes
- `packages/e-info/utils/google-api-auth.ts` - Unused Google API auth utility
- `packages/e-info/components/index/collaboration-section.tsx` - Unused homepage component
- `packages/e-info/components/shared/miso-pageview.tsx` - Unused MISO SDK component

**Removed Constants**:
- `EDITOOLS_API_ENDPOINT` from config.ts
- `OAUTH_CLIENT_ID`, `OAUTH_CLIENT_SECRET`, `OAUTH_REDIRECT_URIS`, `OAUTH_REFRESH_TOKEN` from constant.ts
- `MISO_API_KEY` from config.ts
- `INTERESTED_CATEGORIES`, `NEWSLETTER_OPTIONS`, `NEWSLETTER_FORMAT_OPTIONS` from auth.ts

## Recent Important Changes (2026-02-09)

### 9. Extract Hardcoded Strings to Config Constants

**Changes**:
- Created `constants/social.ts` — centralized social media profile URLs (`SOCIAL_LINKS`) and share URL patterns (`SHARE_URL`)
- Created `constants/layout.ts` — centralized layout (`MAX_CONTENT_WIDTH`), pagination (`POSTS_PER_PAGE`, `POSTS_PER_CATEGORY`), and API timing constants (`CACHE_TTL_MS`, `API_TIMEOUT_MS`, `HEALTH_CHECK_TIMEOUT_MS`)
- Added `HOMEPAGE_API_ENDPOINT`, `HEADER_API_ENDPOINT`, `POPULAR_SEARCH_ENDPOINT` to `config.ts` (consolidated from local switch functions in utility files)
- Replaced hardcoded `max-width: 1200px` across 27 files (39 occurrences) with `${MAX_CONTENT_WIDTH}`
- Replaced local `POSTS_PER_PAGE = 12` definitions in 4 page files with shared import
- Replaced local `CACHE_TTL_MS` and timeout values in `homepage-api.ts` / `header-data.ts` with shared imports
- Removed duplicated endpoint switch functions (`getHomepageApiEndpoint`, `getHeaderApiEndpoint`, `getPopularSearchEndpoint`)

**New Files**:
- `packages/e-info/constants/social.ts`
- `packages/e-info/constants/layout.ts`

**Modified Files** (key files):
- `packages/e-info/constants/config.ts` — added 3 new API endpoint exports
- `packages/e-info/utils/homepage-api.ts` — uses config endpoints and layout constants
- `packages/e-info/utils/header-data.ts` — uses config endpoints and layout constants
- `packages/e-info/components/shared/media-link.tsx` — uses `SHARE_URL`
- `packages/e-info/components/layout/header/header.tsx` — uses `SOCIAL_LINKS`, `MAX_CONTENT_WIDTH`
- `packages/e-info/components/layout/footer.tsx` — uses `SOCIAL_LINKS`, `MAX_CONTENT_WIDTH`
- `packages/e-info/pages/event/[id].tsx` — uses `SHARE_URL`, `MAX_CONTENT_WIDTH`
- `packages/e-info/pages/job/[id].tsx` — uses `SHARE_URL`, `MAX_CONTENT_WIDTH`
- `packages/e-info/pages/{tag,category,section,author}/` — uses `POSTS_PER_PAGE`
- 27 files total for `MAX_CONTENT_WIDTH` replacement

## Development Workflow

### Install Dependencies

```bash
# Root level
yarn install

# Or within e-info package
cd packages/e-info
yarn install
```

### Development Server

```bash
cd packages/e-info
yarn dev

# Or from repo root via yarn workspaces
yarn workspace e-info run dev
```

Runs at `http://localhost:3000` by default

### Build

```bash
cd packages/e-info
yarn build
```

### Linting

```bash
# Within e-info package
yarn next lint

# Auto-fix
yarn next lint --fix
```

### Git Hooks

Project uses husky and lint-staged:
- Pre-commit: Auto-runs eslint --fix on staged files
- **Note**: Files in `packages/draft-renderer` are skipped

### Testing GraphQL API

You can test the API using curl:

```bash
# Example: Query post
curl -X POST "https://eic-cms-gql-dev-1090198686704.asia-east1.run.app/api/graphql" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query ($id: ID!) { posts(where: { id: { equals: $id } }) { id title citations } }",
    "variables": { "id": "238646" }
  }'

# Example: Query all categories
cat > /tmp/query.json << 'EOF'
{
  "query": "query { categories(orderBy: { sortOrder: asc }) { id slug name postsCount posts(take: 3) { id title publishTime } } }"
}
EOF
curl -X POST https://eic-cms-gql-dev-1090198686704.asia-east1.run.app/api/graphql \
  -H 'Content-Type: application/json' \
  -d @/tmp/query.json | jq '.'

# Example: Query all topics with posts and tags
cat > /tmp/query.json << 'EOF'
{
  "query": "query { topics { id title status content heroImage { resized { original w480 w800 } } postsCount posts(take: 5) { id title publishTime } tags { id name } isPinned } }"
}
EOF
curl -X POST https://eic-cms-gql-dev-1090198686704.asia-east1.run.app/api/graphql \
  -H 'Content-Type: application/json' \
  -d @/tmp/query.json | jq '.'
```

**Test IDs in Dev Environment**:
- **Post**: `238659` (最新測試文章, 2025-11-23), `238646` (has heroImage and citations), `238651` (complete citations HTML)
- **Category**: `2` / `testcategory` / "測試中分類" (1 post), `7` / `taiwannews` / "台灣新聞" (8 posts)
- **Section**: `3` / `latestnews` / "時事新聞" (9 categories), `4` / `column` / "專欄" (55 categories)
- **Topic**: `3` / "直擊阿聯氣候新時代" (4 posts, isPinned), `2` / "測試用專題" (8 posts, 2 tags)
- **Tags**: `12` / "深度報導" (1 post), `13` / "中國新聞" (1 post), `16` / "回顧與前瞻" (1 post, 1 topic)

## Deployment

Project uses Google Cloud Build for deployment, configured in `cloudbuild.yaml`.

### Docker Build

```bash
docker build -t eic-web .
```

### Standalone Output

Next.js is configured for standalone output, suitable for containerized deployment.

## Common Issues

### 1. Apollo Client Deprecation Warning

**Issue**: `[ApolloClient]: uri is deprecated`

**Solution**: Use `HttpLink`:
```typescript
import { HttpLink } from '@apollo/client'

new ApolloClient({
  link: new HttpLink({ uri: API_ENDPOINT }),
  cache: new InMemoryCache(),
})
```

### 2. Images Not Displaying

**Issue**: `resized` or `resizedWebp` is null

**Solution**: Use fallback:
```typescript
<SharedImage
  images={image?.resized}
  imagesWebP={image?.resizedWebp}
  src={image?.url}  // fallback
/>
```

### 3. Draft.js Content Rendering Issues

**Issue**: Content not displaying correctly

**Solution**:
- Pass the legacy `content` (Draft.js JSON string) field to `<DraftRenderer />`. The new `contentApiData` array format is **not** rendered by the current `@eic-web/draft-renderer` v1.4.4 — see `post-content.tsx` around line 301
- Use `@eic-web/draft-renderer` v1.4.4
- For brief, same rule applies: render from `brief`, not `briefApiData`

### 4. Citations HTML Not Rendering

**Issue**: HTML tags showing as plain text

**Solution**: Use `dangerouslySetInnerHTML`:
```typescript
<div dangerouslySetInnerHTML={{ __html: postData?.citations || '' }} />
```

### 5. Related Posts Styling Issues

**Issue**: Need to customize Related Posts card styles

**Solution**: Reference the implementation in `related-post.tsx`:
- Use CSS Grid for responsive layout
- Use `SharedImage` for image handling
- Ensure correct import order (SharedImage before styled-components)

## Configuration Files

### next.config.js

Key settings:
- `output: 'standalone'` - For containerized deployment
- SVG loader configuration
- Styled components SSR configuration

### tsconfig.json

Path mapping:
```json
{
  "paths": {
    "~/*": ["./*"]
  }
}
```

### .eslintrc.js

Includes simple-import-sort rules to ensure consistent import ordering.

## Related Documentation & Resources

- **Main Repository**: https://github.com/e-info-taiwan/eic-web
- **Draft Renderer Package**: `@eic-web/draft-renderer`
- **React Components**: `@readr-media/react-component`, `@readr-media/react-image`
- **CMS Backend**: Keystone.js (GraphQL API)

## TODO & Known Issues

### Fixed
- ✅ Apollo Client v4 deprecation warning
- ✅ Post layout refactoring
- ✅ Citations styling update
- ✅ Image rendering fallback
- ✅ Related Posts responsive design
- ✅ GA4 analytics enhancements (article dimensions, conversions, member events)
- ✅ Dead code cleanup (editools, google-sheets API, MISO SDK, unused constants)

### Known Warnings (Not Errors)
- Console statements in development (pages/post, pages/category, etc.)
- Unused imports in legacy code
- React Hook dependency warnings
- These warnings do not affect build success

## Development Tips

1. **Testing Post Pages**: Use post ID `238659` (最新) or `238646` (has citations and heroImage)
2. **Testing Topic Pages**: Use topic ID `3` (直擊阿聯氣候新時代, isPinned) or `2` (測試用專題, 8 posts)
3. **Testing Category Pages**: Use category slug `testcategory` or ID `2`, or `taiwannews` (8 posts)
4. **Testing Section Pages**: Use section slug `latestnews` (時事新聞) or `column` (專欄)
5. **Style Changes**: Use styled-components, follow existing theme settings
6. **GraphQL Queries**: Reference complete query examples in `graphql/query/post.ts` and `graphql/query/category.ts`
7. **Image Handling**: Prefer `resized` and `resizedWebp`, with `src` fallback
8. **Content Rendering**: Render from the legacy `content` (Draft.js JSON string) field via `DraftRenderer`. `contentApiData` is queried by the GraphQL fragment but not yet rendered (DraftRenderer doesn't accept the new array format)
9. **Commit Messages**: Use clear descriptions, reference recent commit style
10. **API Testing**: Use curl with `/tmp/query.json` for complex GraphQL queries (see Testing GraphQL API section)

---

**Last Updated**: 2026-02-04

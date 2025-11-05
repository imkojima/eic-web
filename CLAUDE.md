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
│   │   │   ├── post/             # Post-related components
│   │   │   │   ├── article-type/ # Different article types
│   │   │   │   ├── post-content.tsx
│   │   │   │   ├── post-credit.tsx
│   │   │   │   ├── post-title.tsx
│   │   │   │   ├── related-post.tsx
│   │   │   │   └── tag.tsx
│   │   │   ├── layout/           # Layout components
│   │   │   ├── shared/           # Shared components
│   │   │   ├── index/            # Homepage components (25+ files)
│   │   │   │   └── featured-topics-section.tsx # Featured topics section
│   │   │   ├── about/            # About page components
│   │   │   ├── ad/               # Advertisement components
│   │   │   └── shared/           # Shared components (11 files)
│   │   ├── pages/                # Next.js page routes
│   │   │   ├── _app.tsx          # App entry
│   │   │   ├── _document.tsx     # Document wrapper
│   │   │   ├── _error.tsx        # Error page
│   │   │   ├── index.tsx         # Homepage
│   │   │   ├── node/[id].tsx     # Post/Article page (formerly post/[id].tsx)
│   │   │   ├── category/[slug].tsx # Category listing page
│   │   │   ├── author/[id].tsx   # Author page
│   │   │   ├── tag/[name].tsx    # Tag page
│   │   │   ├── featured-topics.tsx # Featured topics listing
│   │   │   ├── topic/[id].tsx    # Topic detail page with pagination
│   │   │   ├── about.tsx         # About page
│   │   │   ├── privacy-rule.tsx  # Privacy policy page
│   │   │   └── api/              # API routes
│   │   │       ├── robots.ts     # Dynamic robots.txt
│   │   │       └── google-sheets/ # Google Sheets integration
│   │   ├── graphql/              # GraphQL queries & fragments
│   │   │   ├── query/
│   │   │   │   ├── post.ts       # Post queries
│   │   │   │   ├── author.ts     # Author queries
│   │   │   │   ├── category.ts   # Category queries
│   │   │   │   ├── tag.ts        # Tag queries
│   │   │   │   ├── award.ts      # Award data queries
│   │   │   │   ├── collaboration.ts # Collaboration queries
│   │   │   │   ├── dataset.ts    # Dataset queries
│   │   │   │   ├── editor-choice.ts # Editor's choice queries
│   │   │   │   ├── feature.ts    # Feature article queries
│   │   │   │   ├── member.ts     # Member/team queries
│   │   │   │   ├── page-variable.ts # Page variable queries
│   │   │   │   ├── qa.ts         # Q&A content queries
│   │   │   │   └── quote.ts      # Quote queries
│   │   │   └── fragments/
│   │   │       ├── post.ts
│   │   │       ├── author.ts
│   │   │       └── resized-images.ts
│   │   ├── constants/            # Constants
│   │   │   ├── config.ts         # API endpoints config
│   │   │   ├── constant.ts       # Common constants (SITE_TITLE, etc.)
│   │   │   ├── environment-variables.ts # Environment-specific config
│   │   │   └── ad.ts             # Advertisement configurations
│   │   ├── utils/                # Utility functions (9 files)
│   │   │   ├── common.ts         # Common utilities
│   │   │   ├── post.ts           # Post utilities
│   │   │   ├── gtag.ts           # Google Analytics
│   │   │   ├── google-api-auth.ts # Google API auth
│   │   │   └── ...               # Additional utilities
│   │   ├── styles/               # Styles
│   │   │   └── theme/            # styled-components theme
│   │   ├── hooks/                # React Hooks (5 files)
│   │   │   ├── useWindowSize.ts
│   │   │   ├── useInfiniteScroll.ts
│   │   │   ├── useFallbackImage.ts
│   │   │   └── ...
│   │   ├── types/                # TypeScript type definitions
│   │   │   ├── common.ts         # Core types (ResizedImages, ValidPostStyle)
│   │   │   └── component.ts      # Component types
│   │   └── contexts/             # React Context (2 files)
│   │       ├── category-list.ts
│   │       └── header-categories-and-related-posts.ts
│   └── draft-renderer/           # Draft.js content renderer
│       └── (Separate package, migrated to @eic-web/draft-renderer 1.4.4)
├── .husky/                       # Git hooks
├── lerna.json                    # Lerna config
├── package.json                  # Root package.json
└── cloudbuild.yaml              # GCP Cloud Build config
```

## Key Technical Details

### API Environment Configuration

API endpoints are defined in `packages/e-info/constants/config.ts`:

- **Development**: `https://eic-cms-gql-dev-1090198686704.asia-east1.run.app/api/graphql`
- **Staging**: `https://readr-gql-staging-4g6paft7cq-de.a.run.app/api/graphql`
- **Production**: `https://readr-gql-prod-4g6paft7cq-de.a.run.app/api/graphql`

Environment variable `NEXT_PUBLIC_ENV` controls which environment to use (local/dev/staging/prod).

### Environment Variables Configuration

Environment-specific settings are managed in `packages/e-info/constants/environment-variables.ts`, including:

- **SITE_URL**: Domain for each environment (www.readr.tw, staging.readr.tw, dev.readr.tw, localhost)
- **GA_TRACKING_ID**: Google Analytics tracking ID per environment
- **GTM_ID**: Google Tag Manager ID
- **DONATION_PAGE_URL**: Donation page URL
- **GOOGLE_ADSENSE_AD_CLIENT**: Google AdSense client ID
- **JSON URLs**: Static JSON files for header, latest posts, category posts
  - HEADER_JSON_URL
  - LATEST_POSTS_URL
  - LATEST_POSTS_IN_CATEGORIES_URL
  - LATEST_POSTS_IN_CATEGORIES_FOR_CATEGORY_PAGE_URL
- **GLOBAL_CACHE_SETTING**: Cache control settings (prod: `public, max-age=300`, dev/local: `no-store`)
- **QA_RECORD_CONFIG**: Q&A record configuration variables

**Example**:
```typescript
// Production
SITE_URL = 'www.readr.tw'
GA_TRACKING_ID = 'G-4Z12TPZTMB'
LATEST_POSTS_URL = 'https://statics.readr.tw/json/latest-posts.json'

// Development
SITE_URL = 'dev.readr.tw'
GA_TRACKING_ID = 'G-YDKYSDG3RL'
LATEST_POSTS_URL = 'https://storage.googleapis.com/statics-readr-tw-dev/json/latest-posts.json'
```

### Apollo Client Configuration

Apollo Client is initialized in two files:
- `packages/e-info/apollo-client.ts` - Main CMS API
- `packages/e-info/editools-apollo-client.ts` - Editools API

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
  content: string          // Legacy: draft-js JSON string
  contentApiData: JSON     // New: API format content
  brief: JSON              // Legacy: draft-js brief
  briefApiData: JSON       // New: API format brief
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
  posts: [Post]             // Related posts
  postsCount: Int           // Number of posts
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
  heroImage: Photo          // Hero image for topic
  posts: [Post]             // Related articles
  postsCount: Int           // Number of articles
  tags: [Tag]               // Related tags
  tagsCount: Int            // Number of tags
  isPinned: Boolean         // Whether pinned to top
  createdAt: DateTime
  updatedAt: DateTime
  createdBy: User
  updatedBy: User
}
```

**Example Query**:
```graphql
query {
  topics {
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
  }
}
```

**Dev Environment Test Data**:
- Topic ID `1`: "測試專題給測試文章們" (has 1 post, 2 tags)

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

#### ResizedImages Field Names

Image sizes use `w480`, `w800`, `w1200`, `w1600`, `w2400`, **not** `small`, `medium`, `large`.

### Draft.js Content Rendering

The project uses a custom draft-renderer package (`@eic-web/draft-renderer` v1.4.4).

**Important Changes**:
- New API format uses `contentApiData` and `briefApiData` fields
- These fields are JSON objects, passed directly to the `<Eic>` component
- Image rendering uses `SharedImage` component with fallback mechanism:
  ```typescript
  images={resized} or src={image.url}
  ```

### Styled Components Theme

Theme is defined in `packages/e-info/styles/theme/`, including:
- Breakpoints: `sm`, `md`, `lg`, `xl`
- Color system
- Typography

## CRITICAL: Article Routing Change

**⚠️ BREAKING CHANGE** - Article URLs have changed from `/post/[id]` to `/node/[id]`

**Commit**: `f9c0787` - Change post routing from /post/[id] to /node/[id]

**Changes**:
- **Old Route**: `/post/[id].tsx` → `/post/123`
- **New Route**: `/node/[id].tsx` → `/node/123`
- All article/post pages now use the `/node/` route prefix
- File location: `packages/e-info/pages/node/[id].tsx`

**Impact**:
- All internal links to articles should use `/node/[id]` format
- External links using old `/post/` URLs may need redirects
- Update any hardcoded article URLs in the codebase

**Example**:
```typescript
// Old (deprecated)
<Link href="/post/238646">Article</Link>

// New (current)
<Link href="/node/238646">Article</Link>
```

## New Pages & Features

### 1. Featured Topics Listing Page (`/featured-topics`)

**File**: `packages/e-info/pages/featured-topics.tsx`

**Commit**: `1f5dc95` - Add featured topics listing page

**Features**:
- Display featured topics with hero section and article grid
- Responsive layout (1 column mobile, 3 columns desktop)
- Category tabs support
- "進入專題" (Enter Topic) buttons
- **Status**: Currently uses `DUMMY_TOPICS` placeholder data (6 topics)
- **TODO**: Replace with actual API call or JSON data (line 513)

**Route**: `/featured-topics`

### 2. Topic Detail Page with Pagination (`/topic/[id]`)

**File**: `packages/e-info/pages/topic/[id].tsx`

**Commit**: `ee3e99a` - Add featured topic detail page with pagination

**Features**:
- Hero image section with topic title and summary
- Tag system for contributors (editors, writers, photographers, designers, illustrators)
- Paginated article list (6 articles per page)
- Pagination UI with page numbers and forward/back navigation
- Responsive article cards (1 column mobile, 2 columns desktop)
- **Status**: Currently uses `DUMMY_TOPIC` placeholder data (24 dummy articles)
- **TODO**: Replace with actual API call or JSON data (line 805)

**Route**: `/topic/[id]` (e.g., `/topic/1`)

### 3. Privacy Policy Page (`/privacy-rule`)

**File**: `packages/e-info/pages/privacy-rule.tsx`

**Features**:
- Static page using `getStaticProps`
- Full privacy policy in Chinese
- Rendered as static HTML

**Route**: `/privacy-rule`

### 4. Featured Topics Section Component

**File**: `packages/e-info/components/index/featured-topics-section.tsx`

**Purpose**: Homepage section displaying featured topics

**Features**:
- Category tabs for filtering
- Hero article display
- Articles list with images
- Sidebar with ranking section
- Responsive layout (1 column mobile, 2 columns tablet, 3 columns desktop)
- Currently uses dummy data

### 5. API Routes

#### Robots.txt API

**File**: `packages/e-info/pages/api/robots.ts`

**Purpose**: Dynamic robots.txt generation based on environment

**Behavior**:
- **Production**: `User-agent: *\nAllow: /`
- **Other environments**: `User-agent: *\nDisallow: /`

**Access**: `/robots.txt` (via rewrite in next.config.mjs)

#### Google Sheets API Handler

**Files**:
- `packages/e-info/pages/api/google-sheets/index.ts`
- `packages/e-info/pages/api/google-sheets/append.ts`

**Purpose**: Interface with Google Sheets API for data retrieval and appending

**Features**:
- Authentication via Google API credentials
- Spreadsheet queries
- Data manipulation and appending

## Recent Important Changes (2025-10-13 to 2025-11-05)

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

# Or use lerna from root
lerna run dev --scope=readr
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
- **Post**: `238646` (has heroImage and citations), `238651` (complete citations HTML), `238631` (has citations), `238658` (測試文章)
- **Category**: `1` / `ecomid` / "環中" (has 1 post)
- **Topic**: `1` / "測試專題給測試文章們" (has 1 post, 2 tags)
- **Tags**: `13` / "中國新聞", `5` / "台灣新聞"

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
- Use `contentApiData` field (not the old `content` field)
- Use `@eic-web/draft-renderer` v1.4.4
- Ensure you're passing the `contentApiData` JSON object correctly

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

### next.config.mjs

Key settings:
- `output: 'standalone'` - For containerized deployment
- SVG loader configuration with SVGR
- Styled components SSR configuration
- Remote image patterns (allows any hostname for images)
- URL rewrites for `/robots.txt` → `/api/robots`
- `outputFileTracingRoot` for proper monorepo standalone build

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

### Pending API Integration

Several pages currently use placeholder/dummy data and need API integration:

1. **Featured Topics Page** (`featured-topics.tsx:513`)
   - Currently: Uses `DUMMY_TOPICS` array (6 topics)
   - TODO: Replace with actual API call or JSON data fetch

2. **Topic Detail Page** (`topic/[id].tsx:805`)
   - Currently: Uses `DUMMY_TOPIC` object (24 dummy articles)
   - TODO: Replace with actual API call, implement dynamic ID-based fetching

3. **Featured Topics Section Component** (`components/index/featured-topics-section.tsx`)
   - Currently: Uses hardcoded sample data
   - TODO: Integrate with API or JSON data source

4. **Homepage** (`index.tsx`)
   - Multiple TODO comments for GraphQL query migration (lines 4, 13, 46, 61, 175, 200, 265, 328, 395, 444, 468)
   - Several sections temporarily disabled until GraphQL queries are migrated to new API
   - Need to re-enable homepage sections after API migration

### Fixed
- ✅ Apollo Client v4 deprecation warning
- ✅ Post layout refactoring
- ✅ Citations styling update
- ✅ Image rendering fallback
- ✅ Related Posts responsive design
- ✅ Article routing migration from `/post/` to `/node/`
- ✅ Standalone output paths for monorepo build
- ✅ Dynamic robots.txt generation

### Known Warnings (Not Errors)
- Console statements in development (pages/node, pages/category, etc.)
- Unused imports in legacy code
- React Hook dependency warnings
- These warnings do not affect build success

## Development Tips

1. **⚠️ Article URLs**: Always use `/node/[id]` for article links, NOT `/post/[id]` (routing changed)
2. **Testing Post Pages**: Use post ID `238646` for testing in dev environment (includes complete citations and heroImage)
3. **Testing Topic Pages**: Use topic ID `1` for testing (includes heroImage, posts, and tags)
4. **Testing Category Pages**: Use category slug `ecomid` or ID `1` for testing
5. **New Page Routes**:
   - Featured Topics: `/featured-topics` (currently using dummy data)
   - Topic Detail: `/topic/[id]` (currently using dummy data)
   - Privacy Policy: `/privacy-rule`
6. **Style Changes**: Use styled-components, follow existing theme settings in `styles/theme/`
7. **GraphQL Queries**: Reference complete query examples in `graphql/query/` directory
   - Available queries: post, author, category, tag, award, collaboration, dataset, editor-choice, feature, member, page-variable, qa, quote
8. **Image Handling**: Prefer `resized` and `resizedWebp`, with `src` fallback
9. **Content Rendering**: Use `contentApiData` field, not the old `content` field
10. **Environment Variables**: Check `constants/environment-variables.ts` for environment-specific configs
11. **API Routes**:
    - Robots.txt: `/api/robots` (environment-aware)
    - Google Sheets: `/api/google-sheets/*`
12. **Commit Messages**: Use clear descriptions, reference recent commit style
13. **API Testing**: Use curl with `/tmp/query.json` for complex GraphQL queries (see Testing GraphQL API section)
14. **TODO Comments**: Search for "TODO.*API" to find sections needing API integration

---

**Last Updated**: 2025-11-05

## Recent Updates (2025-11-05)

This documentation update includes:
- ✅ CRITICAL routing change documentation: `/post/[id]` → `/node/[id]`
- ✅ New pages: Featured Topics listing, Topic detail with pagination, Privacy policy
- ✅ New API routes: Robots.txt, Google Sheets integration
- ✅ Updated GraphQL queries list (9 new query files)
- ✅ Environment variables configuration details
- ✅ TODO section with pending API integration tasks
- ✅ Comprehensive project structure updates
- ✅ Updated development tips with new routes and features

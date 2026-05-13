import path from 'path'
import * as tsImport from 'ts-import'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const { ENV } = await tsImport.load('./constants/environment-variables.ts')

const { getNextRewrites } = await tsImport.load('./constants/redirects.ts')

const { GCS_STATICS_ORIGIN } = await tsImport.load('./constants/config.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        hostname: '*',
      },
    ],
  },
  compiler: {
    styledComponents: {
      displayName: true,
      ssr: true,
    },
  },
  async rewrites() {
    return [
      {
        source: '/robots.txt',
        destination: '/api/robots',
      },
      // Proxy /images/* to GCS statics bucket
      {
        source: '/images/:path*',
        destination: `${GCS_STATICS_ORIGIN}/images/:path*`,
      },
      // 頁面轉址設定（從 constants/redirects.ts 載入）
      ...getNextRewrites(),
    ]
  },
  webpack: (config, /* eslint-disable-line no-unused-vars */ options) => {
    // svg files
    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            svgoConfig: {
              plugins: [
                {
                  name: 'preset-default',
                  params: {
                    overrides: {
                      // viewBox is required to resize SVGs with CSS.
                      // @see https://github.com/svg/svgo/issues/1128
                      removeViewBox: false,
                    },
                  },
                },
              ],
            },
          },
        },
      ],
    })
    // graphql files
    config.module.rules.push({
      test: /\.(graphql|gql)$/,
      exclude: /node_modules/,
      use: [
        {
          loader: 'graphql-tag/loader',
        },
      ],
    })

    return config
  },
  async redirects() {
    return [
      // Legacy static files → GCS (e.g., /2004/02/0224/040224A.htm)
      {
        source:
          '/:year(\\d{4})/:month(\\d{2})/:day(\\d{4})/:file.:ext([a-zA-Z0-9]+)',
        destination:
          'https://storage.googleapis.com/e-info-legacy/:year/:month/:day/:file.:ext',
        permanent: true,
      },
      // Legacy year index pages → GCS (e.g., /2004/index.htm, /2004/index.html)
      {
        source: '/:year(\\d{4})/index.htm',
        destination:
          'https://storage.googleapis.com/e-info-legacy/:year/index.htm',
        permanent: true,
      },
      {
        source: '/:year(\\d{4})/index.html',
        destination:
          'https://storage.googleapis.com/e-info-legacy/:year/index.html',
        permanent: true,
      },
    ]
  },
  output: 'standalone',
  // In monorepo, tell Next.js where the workspace root is for dependency tracing
  outputFileTracingRoot: path.join(__dirname, '../../'),
  async headers() {
    return [
      // for debug purpose
      {
        source: '/',
        headers: [
          {
            key: 'x-build-env',
            value: ENV,
          },
        ],
      },
    ]
  },
}

export default nextConfig

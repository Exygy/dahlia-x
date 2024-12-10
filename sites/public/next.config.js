/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
})

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config()
}
// Set up app-wide constants
let BACKEND_API_BASE = "http://localhost:3100"
if (process.env.INCOMING_HOOK_BODY && process.env.INCOMING_HOOK_BODY.startsWith("http")) {
  // This is a value that can get set via a Netlify webhook for branch deploys
  BACKEND_API_BASE = decodeURIComponent(process.env.INCOMING_HOOK_BODY)
} else if (process.env.BACKEND_PROXY_BASE) {
  BACKEND_API_BASE = process.env.BACKEND_PROXY_BASE
} else if (process.env.BACKEND_API_BASE) {
  BACKEND_API_BASE = process.env.BACKEND_API_BASE
}
const LISTINGS_QUERY = process.env.LISTINGS_QUERY || "/listings"
console.log(`Using ${BACKEND_API_BASE}${LISTINGS_QUERY} for the listing service.`)

const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN
const HOUSING_COUNSELOR_SERVICE_URL = process.env.HOUSING_COUNSELOR_SERVICE_URL

// Load the Tailwind theme and set up SASS vars
const bloomTheme = require("./tailwind.config.js")
const tailwindVars = require("@bloom-housing/ui-components/tailwind.tosass.js")(bloomTheme)

module.exports = withBundleAnalyzer({
  env: {
    backendApiBase: BACKEND_API_BASE,
    listingServiceUrl: BACKEND_API_BASE + LISTINGS_QUERY,
    listingPhotoSize: process.env.LISTING_PHOTO_SIZE || "1302",
    mapBoxToken: MAPBOX_TOKEN,
    housingCounselorServiceUrl: HOUSING_COUNSELOR_SERVICE_URL,
    gtmKey: process.env.GTM_KEY || null,
    idleTimeout: process.env.IDLE_TIMEOUT,
    jurisdictionName: process.env.JURISDICTION_NAME,
    cacheRevalidate: process.env.CACHE_REVALIDATE ? Number(process.env.CACHE_REVALIDATE) : 60,
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
    showPublicLottery: process.env.SHOW_PUBLIC_LOTTERY === "TRUE",
    showMandatedAccounts: process.env.SHOW_MANDATED_ACCOUNTS === "TRUE",
    showPwdless: process.env.SHOW_PWDLESS === "TRUE",
    maintenanceWindow: process.env.MAINTENANCE_WINDOW,
    reCaptchaKey: process.env.RECAPTCHA_KEY,
    maxClosedListings: process.env.MAX_CLOSED_LISTINGS,
    DD_APPLICATION_ID: process.env.DD_APPLICATION_ID,
    DD_CLIENT_TOKEN: process.env.DD_CLIENT_TOKEN,
    DD_SITE: process.env.DD_SITE,
  },
  i18n: {
    locales: process.env.LANGUAGES ? process.env.LANGUAGES.split(",") : ["en"],
    defaultLocale: "en",
  },
  sassOptions: {
    additionalData: tailwindVars,
  },
  transpilePackages: [
    "@bloom-housing/ui-seeds",
    "@bloom-housing/shared-helpers",
    "@bloom-housing/ui-components",
  ],
  webpack: (config) => {
    config.module.rules.push({
      test: /\.md$/,
      type: "asset/source",
    })

    return config
  },
  // Uncomment line below before building when using symlink for UI-C
  // experimental: { esmExternals: "loose" },
})

if (process.env.SENTRY_ORG) {
  // Injected content via Sentry wizard below

  const { withSentryConfig } = require("@sentry/nextjs")

  module.exports = withSentryConfig(
    module.exports,
    {
      // For all available options, see:
      // https://github.com/getsentry/sentry-webpack-plugin#options

      // Suppresses source map uploading logs during build
      silent: true,

      org: process.env.SENTRY_ORG,
      project: "public",
    },
    {
      // For all available options, see:
      // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

      // Upload a larger set of source maps for prettier stack traces (increases build time)
      widenClientFileUpload: true,

      // Transpiles SDK to be compatible with IE11 (increases bundle size)
      transpileClientSDK: true,

      // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
      tunnelRoute: "/monitoring",

      // Hides source maps from generated client bundles
      hideSourceMaps: true,

      // Automatically tree-shake Sentry logger statements to reduce bundle size
      disableLogger: true,
    }
  )
}

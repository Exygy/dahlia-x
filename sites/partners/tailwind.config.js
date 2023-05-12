/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */

const cloneDeep = require("clone-deep")
const bloomTheme = cloneDeep(require("@bloom-housing/ui-components/tailwind.config.js"))

// Modify bloomTheme to override any Tailwind vars
// For example:
// bloomTheme.theme.colors.white = "#f0f0e9"

module.exports = {
  purge: {
    enabled: process.env.NODE_ENV !== "development",
    content: [
      "./pages/**/*.tsx",
      "./src/**/*.tsx",
      "./layouts/**/*.tsx",
      "../../node_modules/@bloom-housing/ui-seeds/src/**/*.tsx",
      "../../node_modules/@bloom-housing/ui-components/src/**/*.tsx",
    ],
    safelist: [/grid-cols-/],
  },
  ...bloomTheme,
}

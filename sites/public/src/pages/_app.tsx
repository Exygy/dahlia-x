import "@bloom-housing/ui-components/src/global/css-imports.scss"
import "@bloom-housing/ui-components/src/global/app-css.scss"
import "@bloom-housing/ui-seeds/src/global/app-css.scss"
import { datadogRum } from "@datadog/browser-rum"
import React, { useEffect, useMemo, useState } from "react"
import type { AppProps } from "next/app"
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3"
import {
  addTranslation,
  GenericRouter,
  NavigationContext as UICNavigationContext,
} from "@bloom-housing/ui-components"
import { NavigationContext } from "@bloom-housing/ui-seeds/src/global/NavigationContext"
import {
  blankApplication,
  LoggedInUserIdleTimeout,
  ConfigProvider,
  AuthProvider,
  MessageProvider,
} from "@bloom-housing/shared-helpers"
import { headScript, bodyTopTag, pageChangeHandler } from "../lib/customScripts"
import { AppSubmissionContext } from "../lib/applications/AppSubmissionContext"
import ApplicationConductor, {
  loadApplicationFromAutosave,
  loadSavedListing,
} from "../lib/applications/ApplicationConductor"
import { translations, overrideTranslations } from "../lib/translations"
import LinkComponent from "../components/core/LinkComponent"

import "../../styles/overrides.scss"

function BloomApp({ Component, router, pageProps }: AppProps) {
  datadogRum.init({
    applicationId: process.env.DD_APPLICATION_ID,
    clientToken: process.env.DD_CLIENT_TOKEN,
    site: process.env.DD_SITE,
    service: "public-site",
    env: "core_prod",
    sessionSampleRate: 100,
    sessionReplaySampleRate: 20,
    trackUserInteractions: true,
    trackResources: true,
    trackLongTasks: true,
    defaultPrivacyLevel: "mask-user-input",
  })

  const { locale } = router
  //  const initialized = useState(true)
  const [application, setApplication] = useState(() => {
    return loadApplicationFromAutosave() || JSON.parse(JSON.stringify(blankApplication))
  })
  const [savedListing, setSavedListing] = useState(() => {
    return loadSavedListing()
  })

  const conductor = useMemo(() => {
    return new ApplicationConductor(application, savedListing)
  }, [application, savedListing])

  useMemo(() => {
    addTranslation(translations.general, true)
    if (locale && locale !== "en" && translations[locale]) {
      addTranslation(translations[locale])
    }
    addTranslation(overrideTranslations.en)
    if (overrideTranslations[locale]) {
      addTranslation(overrideTranslations[locale])
    }
  }, [locale])

  useEffect(() => {
    if (!document.body.dataset.customScriptsLoaded) {
      router.events.on("routeChangeComplete", pageChangeHandler)

      const headScriptTag = document.createElement("script")
      headScriptTag.textContent = headScript()
      if (headScriptTag.textContent !== "") {
        document.head.append(headScriptTag)
      }

      const bodyTopTagTmpl = document.createElement("template")
      bodyTopTagTmpl.innerHTML = bodyTopTag()
      if (bodyTopTagTmpl.innerHTML !== "") {
        document.body.prepend(bodyTopTagTmpl.content.cloneNode(true))
      }

      document.body.dataset.customScriptsLoaded = "true"
    }
  })

  // Investigating performance issues in #3051
  // useEffect(() => {
  //   if (process.env.NODE_ENV !== "production") {
  //     // eslint-disable-next-line @typescript-eslint/no-var-requires
  //     const axe = require("@axe-core/react")
  //     void axe(React, ReactDOM, 5000)
  //   }
  // }, [])

  // NOTE: Seeds and UI-Components both use a NavigationContext to help internal links use Next's
  // routing system, so we'll include both here until UIC is no longer in use.

  const pageContent = (
    <ConfigProvider apiUrl={process.env.backendApiBase}>
      <AuthProvider>
        <MessageProvider>
          <LoggedInUserIdleTimeout onTimeout={() => conductor.reset()} />
          <Component {...pageProps} />
        </MessageProvider>
      </AuthProvider>
    </ConfigProvider>
  )

  return (
    <NavigationContext.Provider value={{ LinkComponent }}>
      <UICNavigationContext.Provider
        value={{
          LinkComponent,
          router: router as GenericRouter,
        }}
      >
        <AppSubmissionContext.Provider
          value={{
            conductor: conductor,
            application: application,
            listing: savedListing,
            syncApplication: setApplication,
            syncListing: setSavedListing,
          }}
        >
          {process.env.reCaptchaKey ? (
            <GoogleReCaptchaProvider reCaptchaKey={process.env.reCaptchaKey}>
              {pageContent}
            </GoogleReCaptchaProvider>
          ) : (
            pageContent
          )}
        </AppSubmissionContext.Provider>
      </UICNavigationContext.Provider>
    </NavigationContext.Provider>
  )
}

export default BloomApp

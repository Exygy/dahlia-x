import React, { useContext } from "react"
import { useRouter } from "next/router"
import Head from "next/head"
import {
  LocalizedLink,
  SiteHeader,
  SiteFooter,
  FooterNav,
  FooterSection,
  ExygyFooter,
  UserNav,
  t,
  UserContext,
  setSiteAlertMessage,
} from "@bloom-housing/ui-components"
import SVG from "react-inlinesvg"

const Layout = (props) => {
  const { profile, signOut } = useContext(UserContext)
  const router = useRouter()

  const LANGUAGE_CODES = process.env.languages?.split(",")

  /*
    It creates prefixes and translated labels for each language.
    First prefix is always empty, because path does not include language code.
  */
  const LANGUAGES =
    LANGUAGE_CODES?.map((item, index) => ({
      prefix: index === 0 ? "" : item,
      label: t(`languages.${item}`),
    })) || []

  return (
    <div className="site-wrapper">
      <div className="site-content">
        <Head>
          <title>{t("nav.siteTitle")}</title>
        </Head>
        <SiteHeader
          skip={t("nav.skip")}
          logoSrc="/images/logo_glyph.svg"
          logoClass="normal"
          notice={
            <>
              {t("nav.getFeedback")}
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLScr7JuVwiNW8q-ifFUWTFSWqEyV5ndA08jAhJQSlQ4ETrnl9w/viewform?usp=sf_link"
                target="_blank"
              >
                {t("nav.yourFeedback")}
              </a>
              {t("nav.bonusFeedback")}
            </>
          }
          title={t("nav.siteTitle")}
          language={{
            list: LANGUAGES,
            codes: LANGUAGE_CODES,
          }}
        >
          <LocalizedLink href="/listings" className="navbar-item">
            {t("nav.listings")}
          </LocalizedLink>
          {/* Only show Get Assistance if housing counselor data is available */}
          {process.env.housingCounselorServiceUrl && (
            <LocalizedLink href={process.env.housingCounselorServiceUrl} className="navbar-item">
              {t("nav.getAssistance")}
            </LocalizedLink>
          )}
          <UserNav
            signedIn={!!profile}
            signOut={async () => {
              setSiteAlertMessage(t(`authentication.signOut.success`), "notice")
              await router.push("/sign-in")
              signOut()
              window.scrollTo(0, 0)
            }}
          >
            <LocalizedLink href="/account/dashboard" className="navbar-item">
              {t("nav.myDashboard")}
            </LocalizedLink>
            <LocalizedLink href="/account/applications" className="navbar-item">
              {t("nav.myApplications")}
            </LocalizedLink>
            <LocalizedLink href="/account/edit" className="navbar-item">
              {t("nav.accountSettings")}
            </LocalizedLink>
          </UserNav>
        </SiteHeader>
        <main id="main-content">{props.children}</main>
      </div>

      <SiteFooter>
        <FooterSection>
          <img src="/images/alameda-logo-white.svg" alt="Alameda County" />
        </FooterSection>
        <FooterSection>
          <p>
            {t("footer.header")}
            <br />
            <a href={t("footer.headerUrl")} target="_blank">
              {t("footer.headerLink")}
            </a>
          </p>
          <p className="mt-10 text-tiny">{t("footer.forListingQuestions")}</p>
          <p className="text-tiny">{t("footer.forGeneralInquiries")}</p>
          <p className="mt-10 text-tiny">
            {t("footer.forAdditionalOpportunities")}
            <br />
            <a className="px-2" href={t("footer.SFHousingUrl")} target="_blank">
              {t("footer.SFHousingPortal")}
            </a>
            |
            <a className="px-2" href="https://smc.housingbayarea.org/" target="_blank">
              San Mateo County Housing Portal
            </a>
            |
            <a className="px-2" href="https://housing.sanjoseca.gov/" target="_blank">
              City of San José Housing Portal
            </a>
          </p>
        </FooterSection>
        <FooterSection>
          <img
            className="h-16 w-16"
            src="/images/eho-logo-white.svg"
            alt="Equal Housing Opportunity Logo"
          />
        </FooterSection>
        <FooterNav copyright={t("footer.copyRight")}>
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLScr7JuVwiNW8q-ifFUWTFSWqEyV5ndA08jAhJQSlQ4ETrnl9w/viewform?usp=sf_link"
            target="_blank"
          >
            {t("footer.giveFeedback")}
          </a>
          <a href="mailto:achousingportal@acgov.org">{t("footer.contact")}</a>
          <a href="https://www.acgov.org/government/legal.htm" target="_blank">
            {t("footer.disclaimer")}
          </a>
          <LocalizedLink href="/privacy">{t("footer.privacyPolicy")}</LocalizedLink>
        </FooterNav>
        <FooterSection className="bg-black" small>
          <ExygyFooter />
        </FooterSection>
      </SiteFooter>
      <SVG src="/images/icons.svg" />
    </div>
  )
}

export default Layout

import React from "react"
import Head from "next/head"
import {
  PartnersHeader,
  SiteAlert,
  t,
  Breadcrumbs,
  BreadcrumbLink,
} from "@bloom-housing/ui-components"
import Layout from "../../layouts"
import PaperListingForm from "../../src/listings/PaperListingForm"
import { MetaTags } from "../../src/MetaTags"
import ListingGuard from "../../src/ListingGuard"

const NewListing = () => {
  const metaDescription = ""
  const metaImage = "" // TODO: replace with hero image

  return (
    <ListingGuard>
      <Layout>
        <Head>
          <title>{t("nav.siteTitlePartners")}</title>
        </Head>
        <MetaTags
          title={t("nav.siteTitlePartners")}
          image={metaImage}
          description={metaDescription}
        />

        <PartnersHeader
          className="relative"
          title={t("listings.newListing")}
          breadcrumbs={
            <Breadcrumbs>
              <BreadcrumbLink href="/">{t("t.listing")}</BreadcrumbLink>
              <BreadcrumbLink href="/listings/add" current>
                {t("listings.newListing")}
              </BreadcrumbLink>
            </Breadcrumbs>
          }
        >
          <div className="flex top-4 right-4 absolute z-50 flex-col items-center">
            <SiteAlert type="success" timeout={5000} dismissable />
          </div>
        </PartnersHeader>

        <PaperListingForm />
      </Layout>
    </ListingGuard>
  )
}

export default NewListing

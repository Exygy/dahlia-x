import React, { useEffect, useContext } from "react"
import Head from "next/head"
import { PageHeader, t } from "@bloom-housing/ui-components"
import { ListingList, pushGtmEvent, AuthContext } from "@bloom-housing/shared-helpers"
import { UserStatus } from "../../lib/constants"
import Layout from "../../layouts/application"
import { MetaTags } from "../../components/shared/MetaTags"
import { Listing } from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import { ListingCard } from "./ListingCard"
import styles from "./ListingDirectory.module.scss"
import { Heading } from "@bloom-housing/ui-seeds"

export interface ListingDirectoryProps {
  openListings: Listing[]
  closedListings: Listing[]
}

export const ListingDirectory = (props: ListingDirectoryProps) => {
  const { profile } = useContext(AuthContext)
  const pageTitle = `${t("pageTitle.rent")} - ${t("nav.siteTitle")}`
  const metaDescription = t("pageDescription.welcome", { regionName: t("region.name") })

  useEffect(() => {
    pushGtmEvent<ListingList>({
      event: "pageView",
      pageTitle: "Rent Affordable Housing - Housing Portal",
      status: profile ? UserStatus.LoggedIn : UserStatus.NotLoggedIn,
      numberOfListings: props.openListings.length,
      listingIds: props.openListings.map((listing) => listing.id),
    })
  }, [profile, props.openListings])

  return (
    <Layout>
      <Head>
        <title>{pageTitle}</title>
      </Head>

      <MetaTags title={t("nav.siteTitle")} description={metaDescription} />
      <PageHeader title={t("pageTitle.rent")} />

      <div className={styles["listing-directory"]}>
        <div className={styles["content-wrapper"]}>
          {/* TODO Show open/closed listings once we have designs for pagination */}
          <>
            {props.openListings.length > 0 ? (
              <ul>
                {props.openListings.map((listing, index) => {
                  return <ListingCard listing={listing} key={index} />
                })}
              </ul>
            ) : (
              <div className={styles["empty-state"]}>
                <Heading size={"xl"} priority={2} className={styles["empty-heading"]}>
                  {t("listings.noOpenListings")}
                </Heading>
              </div>
            )}
          </>
        </div>
      </div>
    </Layout>
  )
}

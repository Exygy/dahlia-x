import React, { useContext } from "react"
import { t } from "@bloom-housing/ui-components"
import { FieldValue, Grid } from "@bloom-housing/ui-seeds"
import { ListingContext } from "../../ListingContext"
import { getDetailFieldString } from "./helpers"
import SectionWithGrid from "../../../shared/SectionWithGrid"
import { AuthContext } from "@bloom-housing/shared-helpers"
import { FeatureFlagEnum } from "@bloom-housing/shared-helpers/src/types/backend-swagger"

const DetailBuildingDetails = () => {
  const listing = useContext(ListingContext)
  const { doJurisdictionsHaveFeatureFlagOn } = useContext(AuthContext)

  const enableRegions = doJurisdictionsHaveFeatureFlagOn(
    FeatureFlagEnum.enableRegions,
    listing.jurisdictions.id
  )

  return (
    <SectionWithGrid heading={t("listings.sections.buildingDetailsTitle")} inset>
      <SectionWithGrid.HeadingRow>Building Address</SectionWithGrid.HeadingRow>
      {listing.listingsBuildingAddress ? (
        <>
          <Grid.Row columns={3}>
            <FieldValue
              id="buildingAddress.street"
              className="seeds-grid-span-2"
              label={t("application.contact.streetAddress")}
            >
              {listing.listingsBuildingAddress?.street}
            </FieldValue>
            <FieldValue id="neighborhood" label={t("t.neighborhood")}>
              {listing?.neighborhood}
            </FieldValue>
          </Grid.Row>
          <Grid.Row columns={6}>
            <FieldValue
              id="buildingAddress.city"
              className="seeds-grid-span-2"
              label={t("application.contact.city")}
            >
              {listing.listingsBuildingAddress?.city}
            </FieldValue>
            <FieldValue id="buildingAddress.state" label={t("application.contact.state")}>
              {listing.listingsBuildingAddress?.state}
            </FieldValue>
            <FieldValue id="buildingAddress.zipCode" label={t("application.contact.zip")}>
              {listing.listingsBuildingAddress?.zipCode}
            </FieldValue>
            {enableRegions ? (
              <FieldValue
                className="seeds-grid-span-2"
                id="buildingAdress.region"
                label={t("t.region")}
              >
                {listing.region ? listing.region.toString().replace("_", " ") : t("t.n/a")}
              </FieldValue>
            ) : (
              <FieldValue
                className="seeds-grid-span-2"
                id="yearBuilt"
                label={t("listings.yearBuilt")}
              >
                {listing.yearBuilt}
              </FieldValue>
            )}
          </Grid.Row>
          <Grid.Row columns={3}>
            <FieldValue id="longitude" label={t("listings.longitude")}>
              {listing.listingsBuildingAddress?.longitude &&
                listing.listingsBuildingAddress.longitude.toString()}
            </FieldValue>
            <FieldValue id="latitude" label={t("listings.latitude")}>
              {listing.listingsBuildingAddress?.latitude &&
                listing.listingsBuildingAddress.latitude.toString()}
            </FieldValue>
            {enableRegions && (
              <FieldValue id="yearBuilt" label={t("listings.yearBuilt")}>
                {listing.yearBuilt}
              </FieldValue>
            )}
          </Grid.Row>
        </>
      ) : (
        <FieldValue>{getDetailFieldString(null)}</FieldValue>
      )}
    </SectionWithGrid>
  )
}

export default DetailBuildingDetails

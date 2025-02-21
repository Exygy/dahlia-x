import React, { useContext } from "react"
import { t } from "@bloom-housing/ui-components"
import { FieldValue, Grid } from "@bloom-housing/ui-seeds"
import { ListingContext } from "../../ListingContext"
import { getDetailFieldString } from "./helpers"
import SectionWithGrid from "../../../shared/SectionWithGrid"

const DetailNeighborhoodAmenities = () => {
  const listing = useContext(ListingContext)
  return (
    <SectionWithGrid heading={t("listings.sections.neighborhoodAmenitiesTitle")} inset>
      <Grid.Row>
        <FieldValue
          id="neighborhoodAmenities.groceryStores"
          label={t("listings.amenities.groceryStores")}
        >
          {getDetailFieldString(listing.listingNeighborhoodAmenities?.groceryStores)}
        </FieldValue>
      </Grid.Row>
      <Grid.Row>
        <FieldValue
          id="neighborhoodAmenities.publicTransportation"
          label={t("listings.amenities.publicTransportation")}
        >
          {getDetailFieldString(listing.listingNeighborhoodAmenities?.publicTransportation)}
        </FieldValue>
      </Grid.Row>
      <Grid.Row>
        <FieldValue id="neighborhoodAmenities.schools" label={t("listings.amenities.schools")}>
          {getDetailFieldString(listing.listingNeighborhoodAmenities?.schools)}
        </FieldValue>
      </Grid.Row>
      <Grid.Row>
        <FieldValue
          id="neighborhoodAmenities.parksAndCommunityCenters"
          label={t("listings.amenities.parksAndCommunityCenters")}
        >
          {getDetailFieldString(listing.listingNeighborhoodAmenities?.parksAndCommunityCenters)}
        </FieldValue>
      </Grid.Row>
      <Grid.Row>
        <FieldValue
          id="neighborhoodAmenities.pharmacies"
          label={t("listings.amenities.pharmacies")}
        >
          {getDetailFieldString(listing.listingNeighborhoodAmenities?.pharmacies)}
        </FieldValue>
      </Grid.Row>
      <Grid.Row>
        <FieldValue
          id="neighborhoodAmenities.healthCareResources"
          label={t("listings.amenities.healthCareResources")}
        >
          {getDetailFieldString(listing.listingNeighborhoodAmenities?.healthCareResources)}
        </FieldValue>
      </Grid.Row>
    </SectionWithGrid>
  )
}

export default DetailNeighborhoodAmenities

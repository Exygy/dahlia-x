import React, { useContext } from "react"
import { useFormContext } from "react-hook-form"
import { t, Textarea } from "@bloom-housing/ui-components"
import { Grid } from "@bloom-housing/ui-seeds"
import SectionWithGrid from "../../../shared/SectionWithGrid"
import { AuthContext } from "@bloom-housing/shared-helpers"
import { FeatureFlagEnum } from "@bloom-housing/shared-helpers/src/types/backend-swagger"

const NeighborhoodAmenities = () => {
  const formMethods = useFormContext()
  const { doJurisdictionsHaveFeatureFlagOn } = useContext(AuthContext)

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { register, watch } = formMethods
  const jurisdiction = watch("jurisdictions.id")

  const enableNeighborhoodAmenities = doJurisdictionsHaveFeatureFlagOn(
    FeatureFlagEnum.enableNeighborhoodAmenities,
    jurisdiction
  )

  return enableNeighborhoodAmenities ? (
    <>
      <hr className="spacer-section-above spacer-section" />
      <SectionWithGrid
        heading={t("listings.sections.neighborhoodAmenitiesTitle")}
        subheading={t("listings.sections.neighborhoodAmenitiesSubtitle")}
      >
        <Grid.Row>
          <Grid.Cell>
            <Textarea
              label={t("listings.amenities.groceryStores")}
              name={"listingNeighborhoodAmenities.groceryStores"}
              id={"listingNeighborhoodAmenities.groceryStores"}
              fullWidth={true}
              register={register}
            />
          </Grid.Cell>
          <Grid.Cell>
            <Textarea
              label={t("listings.amenities.publicTransportation")}
              name={"listingNeighborhoodAmenities.publicTransportation"}
              id={"listingNeighborhoodAmenities.publicTransportation"}
              fullWidth={true}
              register={register}
            />
          </Grid.Cell>
        </Grid.Row>
        <Grid.Row>
          <Grid.Cell>
            <Textarea
              label={t("listings.amenities.schools")}
              name={"listingNeighborhoodAmenities.schools"}
              id={"listingNeighborhoodAmenities.schools"}
              fullWidth={true}
              register={register}
            />
          </Grid.Cell>
          <Grid.Cell>
            <Textarea
              label={t("listings.amenities.parksAndCommunityCenters")}
              name={"listingNeighborhoodAmenities.parksAndCommunityCenters"}
              id={"listingNeighborhoodAmenities.parksAndCommunityCenters"}
              fullWidth={true}
              register={register}
            />
          </Grid.Cell>
        </Grid.Row>
        <Grid.Row>
          <Grid.Cell>
            <Textarea
              label={t("listings.amenities.pharmacies")}
              name={"listingNeighborhoodAmenities.pharmacies"}
              id={"listingNeighborhoodAmenities.pharmacies"}
              fullWidth={true}
              register={register}
            />
          </Grid.Cell>
          <Grid.Cell>
            <Textarea
              label={t("listings.amenities.healthCareResources")}
              name={"listingNeighborhoodAmenities.healthCareResources"}
              id={"listingNeighborhoodAmenities.healthCareResources"}
              fullWidth={true}
              register={register}
            />
          </Grid.Cell>
        </Grid.Row>
      </SectionWithGrid>
    </>
  ) : (
    <></>
  )
}

export default NeighborhoodAmenities

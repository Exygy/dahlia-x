import { useContext } from "react"
import { ListingContext } from "../../ListingContext"
import SectionWithGrid from "../../../shared/SectionWithGrid"
import { FieldValue, Grid } from "@bloom-housing/ui-seeds"
import { t } from "@bloom-housing/ui-components"
import { AuthContext } from "@bloom-housing/shared-helpers"

const DetailListingVerification = () => {
  const listing = useContext(ListingContext)
  const { doJurisdictionsHaveFeatureFlagOn } = useContext(AuthContext)

  const enableIsVerified = doJurisdictionsHaveFeatureFlagOn(
    "enableIsVerified",
    listing.jurisdictions.id
  )

  if (!enableIsVerified) {
    return null
  }

  return (
    <SectionWithGrid heading={t("listings.sections.verificationTitle")} inset>
      <Grid.Row>
        <FieldValue label={t("listings.sections.verification")}>
          {listing.isVerified ? t("t.yes") : t("t.no")}
        </FieldValue>
      </Grid.Row>
    </SectionWithGrid>
  )
}

export default DetailListingVerification

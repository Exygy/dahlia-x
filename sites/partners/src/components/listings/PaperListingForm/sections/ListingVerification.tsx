import { Field, t } from "@bloom-housing/ui-components"
import SectionWithGrid from "../../../shared/SectionWithGrid"
import { useFormContext } from "react-hook-form"
import { useContext } from "react"
import { AuthContext } from "@bloom-housing/shared-helpers"

const ListingVerification = () => {
  const { doJurisdictionsHaveFeatureFlagOn } = useContext(AuthContext)
  const formMethods = useFormContext()

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { register, watch } = formMethods

  const jurisdiction = watch("jurisdictions.id")

  const enableIsVerified = doJurisdictionsHaveFeatureFlagOn("enableIsVerified", jurisdiction)

  return (
    <>
      {enableIsVerified && (
        <SectionWithGrid
          heading={t("listings.sections.verificationTitle")}
          subheading={t("listings.sections.verificationSubtitle")}
        >
          <Field
            id="isVerified"
            name="isVerified"
            type="checkbox"
            label={t("listings.sections.verificationLabel")}
            dataTestId="verifyListing"
            register={register}
          />
        </SectionWithGrid>
      )}
    </>
  )
}

export default ListingVerification

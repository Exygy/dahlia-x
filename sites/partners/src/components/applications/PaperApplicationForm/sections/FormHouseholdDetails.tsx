import React from "react"
import { useFormContext } from "react-hook-form"
import { t, Field, FieldGroup } from "@bloom-housing/ui-components"
import { FieldValue, Grid } from "@bloom-housing/ui-seeds"
import { getUniqueUnitTypes, adaFeatureKeys } from "@bloom-housing/shared-helpers"
import { Accessibility, UnitType } from "@bloom-housing/backend-core/types"
import { YesNoAnswer } from "../../../../lib/helpers"
import { Unit } from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import SectionWithGrid from "../../../shared/SectionWithGrid"

type FormHouseholdDetailsProps = {
  listingUnits: Unit[]
  applicationUnitTypes: UnitType[]
  applicationAccessibilityFeatures: Accessibility
}

const FormHouseholdDetails = ({
  listingUnits,
  applicationUnitTypes,
  applicationAccessibilityFeatures,
}: FormHouseholdDetailsProps) => {
  const formMethods = useFormContext()

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { register } = formMethods

  const unitTypes = getUniqueUnitTypes(listingUnits)

  const preferredUnitOptions = unitTypes?.map((item) => {
    const isChecked = !!applicationUnitTypes?.find((unit) => unit.id === item.id) ?? false

    return {
      id: item.id,
      label: t(`application.household.preferredUnit.options.${item.name}`),
      value: item.id,
      defaultChecked: isChecked,
      dataTestId: `preferredUnit.${item.name}`,
    }
  })

  const adaFeaturesOptions = adaFeatureKeys.map((item) => {
    const isChecked =
      applicationAccessibilityFeatures &&
      Object.keys(applicationAccessibilityFeatures).includes(item) &&
      applicationAccessibilityFeatures[item] === true

    return {
      id: item,
      label: t(`application.add.${item}`),
      value: item,
      defaultChecked: isChecked,
      dataTestId: `adaFeature.${item}`,
    }
  })

  return (
    <>
      <hr className="spacer-section-above spacer-section" />
      <SectionWithGrid heading={t("application.review.householdDetails")}>
        <Grid.Row>
          <Grid.Cell>
            <FieldGroup
              type="checkbox"
              name="application.preferredUnit"
              fields={preferredUnitOptions}
              groupLabel={t("application.details.preferredUnitSizes")}
              register={register}
              fieldGroupClassName="grid grid-cols-1 mt-4"
              fieldClassName="ml-0"
            />
          </Grid.Cell>

          <Grid.Cell>
            <fieldset>
              <FieldGroup
                type="checkbox"
                name="application.accessibility"
                fields={adaFeaturesOptions}
                register={register}
                groupLabel={t("application.details.adaPriorities")}
                fieldGroupClassName="grid grid-cols-1 mt-4"
                fieldClassName="ml-0"
              />
            </fieldset>
          </Grid.Cell>

          <FieldValue label={t("application.household.expectingChanges.title")}>
            <div className="flex h-12 items-center">
              <Field
                id="application.householdExpectingChangesYes"
                name="application.householdExpectingChanges"
                className="m-0"
                type="radio"
                label={t("t.yes")}
                register={register}
                inputProps={{
                  value: YesNoAnswer.Yes,
                }}
              />

              <Field
                id="application.householdExpectingChangesNo"
                name="application.householdExpectingChanges"
                className="m-0"
                type="radio"
                label={t("t.no")}
                register={register}
                inputProps={{
                  value: YesNoAnswer.No,
                }}
              />
            </div>
          </FieldValue>
        </Grid.Row>
        <Grid.Row columns="3">
          <FieldValue label={t("application.household.householdStudent.title")}>
            <div className="flex h-12 items-center">
              <Field
                id="application.householdStudentYes"
                name="application.householdStudent"
                className="m-0"
                type="radio"
                label={t("t.yes")}
                register={register}
                inputProps={{
                  value: YesNoAnswer.Yes,
                }}
              />

              <Field
                id="application.householdStudentNo"
                name="application.householdStudent"
                className="m-0"
                type="radio"
                label={t("t.no")}
                register={register}
                inputProps={{
                  value: YesNoAnswer.No,
                }}
              />
            </div>
          </FieldValue>
        </Grid.Row>
      </SectionWithGrid>
    </>
  )
}

export { FormHouseholdDetails as default, FormHouseholdDetails }

import React, { useContext, useEffect, useState } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import {
  t,
  Field,
  Select,
  FieldGroup,
  ListingMap,
  LatitudeLongitude,
  GridCell,
} from "@bloom-housing/ui-components"
import { FieldValue, Grid } from "@bloom-housing/ui-seeds"
import { AuthContext, stateKeys } from "@bloom-housing/shared-helpers"
import { FormListing } from "../../../../lib/listings/formTypes"
import GeocodeService, {
  GeocodeService as GeocodeServiceType,
} from "@mapbox/mapbox-sdk/services/geocoding"
import { fieldHasError, fieldMessage } from "../../../../lib/helpers"
import SectionWithGrid from "../../../shared/SectionWithGrid"
import {
  FeatureFlagEnum,
  RegionEnum,
} from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import { neighborhoodRegions } from "../../../../lib/listings/Neighborhoods"
import { GridRow } from "@bloom-housing/ui-seeds/src/layout/Grid"

interface MapBoxFeature {
  center: number[] // Index 0: longitude, Index 1: latitude
}

interface MapboxApiResponseBody {
  features: MapBoxFeature[]
}

interface MapboxApiResponse {
  body: MapboxApiResponseBody
}

type BuildingDetailsProps = {
  listing?: FormListing
  latLong?: LatitudeLongitude
  setLatLong?: (latLong: LatitudeLongitude) => void
  customMapPositionChosen?: boolean
  setCustomMapPositionChosen?: (customMapPosition: boolean) => void
}

const BuildingDetails = ({
  listing,
  setLatLong,
  latLong,
  customMapPositionChosen,
  setCustomMapPositionChosen,
}: BuildingDetailsProps) => {
  const formMethods = useFormContext()
  const { doJurisdictionsHaveFeatureFlagOn } = useContext(AuthContext)

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { register, watch, control, getValues, setValue, errors, clearErrors } = formMethods

  const [geocodingClient, setGeocodingClient] = useState<GeocodeServiceType>()

  interface BuildingAddress {
    city: string
    state: string
    street: string
    zipCode: string
  }

  const buildingAddress: BuildingAddress = useWatch({
    control,
    name: "listingsBuildingAddress",
  })

  const mapPinPosition = useWatch({
    control,
    name: "mapPinPosition",
  })

  const displayMapPreview = () => {
    return (
      buildingAddress?.city &&
      buildingAddress?.state &&
      buildingAddress?.street &&
      buildingAddress?.zipCode &&
      buildingAddress?.zipCode.length >= 5
    )
  }

  useEffect(() => {
    if (process.env.mapBoxToken || process.env.MAPBOX_TOKEN) {
      setGeocodingClient(
        GeocodeService({
          accessToken: process.env.mapBoxToken || process.env.MAPBOX_TOKEN,
        })
      )
    }
  }, [])

  const getNewLatLong = () => {
    if (
      buildingAddress?.city &&
      buildingAddress?.state &&
      buildingAddress?.street &&
      buildingAddress?.zipCode &&
      geocodingClient
    ) {
      geocodingClient
        .forwardGeocode({
          query: `${buildingAddress.street}, ${buildingAddress.city}, ${buildingAddress.state}, ${buildingAddress.zipCode}`,
          limit: 1,
        })
        .send()
        .then((response: MapboxApiResponse) => {
          setLatLong({
            latitude: response.body.features[0].center[1],
            longitude: response.body.features[0].center[0],
          })
        })
        .catch((err) => console.error(`Error calling Mapbox API: ${err}`))
    }
  }

  useEffect(() => {
    let timeout
    if (!customMapPositionChosen || mapPinPosition === "automatic") {
      timeout = setTimeout(() => {
        getNewLatLong()
      }, 1000)
    }
    return () => {
      clearTimeout(timeout)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    buildingAddress?.city,
    buildingAddress?.state,
    buildingAddress?.street,
    buildingAddress?.zipCode,
  ])

  useEffect(() => {
    if (mapPinPosition === "automatic") {
      getNewLatLong()
      setCustomMapPositionChosen(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapPinPosition])

  const getAddressErrorMessage = (fieldKey: string, defaultMessage: string) => {
    return errors?.listingsBuildingAddress && !getValues(fieldKey)
      ? t("errors.partialAddress")
      : defaultMessage
  }

  const enableRegions = doJurisdictionsHaveFeatureFlagOn(
    FeatureFlagEnum.enableRegions,
    listing?.jurisdictions?.id
  )

  const { neighborhood, region } = watch(["neighborhood", "region"])

  useEffect(() => {
    const matchingConfig = neighborhoodRegions.find((entry) => entry.name == neighborhood)
    if (matchingConfig && matchingConfig.region !== region) {
      setValue("region", matchingConfig.region)
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [neighborhood, setValue])
  return (
    <>
      <hr className="spacer-section-above spacer-section" />
      <SectionWithGrid
        heading={t("listings.sections.buildingDetailsTitle")}
        subheading={t("listings.sections.buildingDetailsSubtitle")}
      >
        <SectionWithGrid.HeadingRow>
          {t("listings.sections.buildingAddress")}
        </SectionWithGrid.HeadingRow>
        <Grid.Row columns={3}>
          <Grid.Cell className="seeds-grid-span-2">
            <Field
              label={t("application.contact.streetAddress")}
              name={"listingsBuildingAddress.street"}
              id={"listingsBuildingAddress.street"}
              error={
                !!getAddressErrorMessage(
                  "listingsBuildingAddress.street",
                  fieldMessage(errors?.listingsBuildingAddress?.street)
                )
              }
              errorMessage={getAddressErrorMessage(
                "listingsBuildingAddress.street",
                fieldMessage(errors?.listingsBuildingAddress?.street)
              )}
              placeholder={t("application.contact.streetAddress")}
              inputProps={{
                onChange: () =>
                  fieldHasError(errors?.listingsBuildingAddress?.street) &&
                  clearErrors("listingsBuildingAddress"),
              }}
              register={register}
            />
          </Grid.Cell>
          <GridCell>
            {enableRegions ? (
              <FieldValue label={t("t.neighborhood")}>
                <Select
                  name={"neighborhood"}
                  id={"neighborhood"}
                  placeholder={t("listings.sections.neighborhoodPlaceholder")}
                  inputProps={{
                    className: "w-full",
                  }}
                  register={register}
                  options={neighborhoodRegions.map((entry) => ({
                    value: entry.name,
                    label: entry.name,
                  }))}
                />
              </FieldValue>
            ) : (
              <Field
                label={t("t.neighborhood")}
                name={"neighborhood"}
                id={"neighborhood"}
                placeholder={t("t.neighborhood")}
                register={register}
              />
            )}
          </GridCell>
        </Grid.Row>
        <Grid.Row columns={6}>
          <Grid.Cell className="seeds-grid-span-2">
            <Field
              label={t("application.contact.city")}
              name={"listingsBuildingAddress.city"}
              id={"listingsBuildingAddress.city"}
              error={
                !!getAddressErrorMessage(
                  "listingsBuildingAddress.city",
                  fieldMessage(errors?.listingsBuildingAddress?.city)
                )
              }
              errorMessage={getAddressErrorMessage(
                "listingsBuildingAddress.city",
                fieldMessage(errors?.listingsBuildingAddress?.city)
              )}
              placeholder={t("application.contact.city")}
              inputProps={{
                onChange: () =>
                  fieldHasError(errors?.listingsBuildingAddress?.city) &&
                  clearErrors("listingsBuildingAddress"),
              }}
              register={register}
            />
          </Grid.Cell>
          <Grid.Cell>
            <FieldValue
              label={t("application.contact.state")}
              className={`mb-0 ${
                getAddressErrorMessage(
                  "listingsBuildingAddress.state",
                  fieldMessage(errors?.listingsBuildingAddress?.state)
                )
                  ? "field-value-error"
                  : ""
              }`}
            >
              <Select
                id={`listingsBuildingAddress.state`}
                name={`listingsBuildingAddress.state`}
                error={
                  !!getAddressErrorMessage(
                    "listingsBuildingAddress.state",
                    fieldMessage(errors?.listingsBuildingAddress?.state)
                  )
                }
                errorMessage={getAddressErrorMessage(
                  "listingsBuildingAddress.state",
                  fieldMessage(errors?.listingsBuildingAddress?.state)
                )}
                label={t("application.contact.state")}
                labelClassName="sr-only"
                register={register}
                controlClassName="control"
                options={stateKeys}
                keyPrefix="states"
                inputProps={{
                  onChange: () =>
                    fieldHasError(errors?.listingsBuildingAddress?.state) &&
                    clearErrors("listingsBuildingAddress"),
                }}
              />
            </FieldValue>
          </Grid.Cell>
          <Grid.Cell>
            <Field
              label={t("application.contact.zip")}
              name={"listingsBuildingAddress.zipCode"}
              id={"listingsBuildingAddress.zipCode"}
              placeholder={t("application.contact.zip")}
              error={
                !!getAddressErrorMessage(
                  "listingsBuildingAddress.zipCode",
                  fieldMessage(errors?.listingsBuildingAddress?.zipCode)
                )
              }
              errorMessage={getAddressErrorMessage(
                "listingsBuildingAddress.zipCode",
                fieldMessage(errors?.listingsBuildingAddress?.zipCode)
              )}
              inputProps={{
                onChange: () =>
                  fieldHasError(errors?.listingsBuildingAddress?.zipCode) &&
                  clearErrors("listingsBuildingAddress"),
              }}
              register={register}
            />
          </Grid.Cell>
          <Grid.Cell className="seeds-grid-span-2">
            {enableRegions ? (
              <FieldValue label={t("t.region")}>
                <Select
                  id="region"
                  name="region"
                  placeholder={t("listings.sections.regionPlaceholder")}
                  register={register}
                  inputProps={{
                    className: "w-full",
                    onChange: () => setValue("neighborhood", undefined),
                  }}
                  options={Object.keys(RegionEnum).map((entry) => ({
                    value: entry,
                    label: entry.toString().replace("_", " "),
                  }))}
                />
              </FieldValue>
            ) : (
              <Field
                label={t("listings.yearBuilt")}
                name={"yearBuilt"}
                id={"yearBuilt"}
                placeholder={t("listings.yearBuilt")}
                type={"number"}
                register={register}
              />
            )}
          </Grid.Cell>
        </Grid.Row>
        <GridRow columns={3}>
          <GridCell>
            <p className="field-sub-note">{t("listings.requiredToPublish")}</p>
          </GridCell>
          <GridCell className="col-start-3">
            {enableRegions && (
              <Field
                label={t("listings.yearBuilt")}
                name={"yearBuilt"}
                id={"yearBuilt"}
                placeholder={t("listings.yearBuilt")}
                type={"number"}
                register={register}
              />
            )}
          </GridCell>
        </GridRow>
        <Grid.Row columns={3}>
          <Grid.Cell className="seeds-grid-span-2">
            <FieldValue label={t("listings.mapPreview")}>
              {displayMapPreview() ? (
                <ListingMap
                  listingName={listing?.name}
                  address={{
                    city: buildingAddress.city,
                    state: buildingAddress.state,
                    street: buildingAddress.street,
                    zipCode: buildingAddress.zipCode,
                    latitude: latLong.latitude,
                    longitude: latLong.longitude,
                  }}
                  enableCustomPinPositioning={getValues("mapPinPosition") === "custom"}
                  setCustomMapPositionChosen={setCustomMapPositionChosen}
                  setLatLong={setLatLong}
                />
              ) : (
                <div
                  className={"w-full bg-gray-400 p-3 flex items-center justify-center"}
                  style={{ height: "400px" }}
                >
                  {t("listings.mapPreviewNoAddress")}
                </div>
              )}
            </FieldValue>
          </Grid.Cell>
          <Grid.Cell>
            <p className="field-label m-4 ml-0">{t("listings.mapPinPosition")}</p>
            <FieldGroup
              name="mapPinPosition"
              type="radio"
              fieldGroupClassName={"flex-col"}
              fieldClassName={"ml-0"}
              register={register}
              fields={[
                {
                  label: t("t.automatic"),
                  value: "automatic",
                  id: "automatic",
                  note: t("listings.mapPinAutomaticDescription"),
                  defaultChecked: !listing?.customMapPin,
                },
                {
                  label: t("t.custom"),
                  value: "custom",
                  id: "custom",
                  note: t("listings.mapPinCustomDescription"),
                  defaultChecked: listing?.customMapPin,
                },
              ]}
            />
          </Grid.Cell>
        </Grid.Row>
      </SectionWithGrid>
    </>
  )
}

export default BuildingDetails

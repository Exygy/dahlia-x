import React, { useState, useCallback, useContext, useEffect } from "react"
import { useRouter } from "next/router"
import dayjs from "dayjs"
import { t, Form, AlertBox, LoadingOverlay, LatitudeLongitude } from "@bloom-housing/ui-components"
import { Button, Icon, Tabs } from "@bloom-housing/ui-seeds"
import ChevronLeftIcon from "@heroicons/react/20/solid/ChevronLeftIcon"
import ChevronRightIcon from "@heroicons/react/20/solid/ChevronRightIcon"
import { AuthContext, MessageContext, listingSectionQuestions } from "@bloom-housing/shared-helpers"
import {
  FeatureFlag,
  ListingCreate,
  ListingEventsTypeEnum,
  ListingUpdate,
  ListingsStatusEnum,
  MultiselectQuestion,
  MultiselectQuestionsApplicationSectionEnum,
} from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import { useForm, FormProvider } from "react-hook-form"
import {
  AlertErrorType,
  FormListing,
  TempEvent,
  TempUnit,
  formDefaults,
} from "../../../lib/listings/formTypes"
import ListingDataPipeline from "../../../lib/listings/ListingDataPipeline"
import ListingFormActions, { ListingFormActionsType } from "../ListingFormActions"
import AdditionalDetails from "./sections/AdditionalDetails"
import AdditionalEligibility from "./sections/AdditionalEligibility"
import LeasingAgent from "./sections/LeasingAgent"
import AdditionalFees from "./sections/AdditionalFees"
import Units from "./sections/Units"
import BuildingDetails from "./sections/BuildingDetails"
import ListingIntro from "./sections/ListingIntro"
import ListingPhotos from "./sections/ListingPhotos"
import BuildingFeatures from "./sections/BuildingFeatures"
import RankingsAndResults from "./sections/RankingsAndResults"
import ApplicationAddress from "./sections/ApplicationAddress"
import ApplicationDates from "./sections/ApplicationDates"
import LotteryResults from "./sections/LotteryResults"
import ApplicationTypes from "./sections/ApplicationTypes"
import SelectAndOrder from "./sections/SelectAndOrder"
import CommunityType from "./sections/CommunityType"
import BuildingSelectionCriteria from "./sections/BuildingSelectionCriteria"
import { getReadableErrorMessage } from "../PaperListingDetails/sections/helpers"
import { useJurisdictionalMultiselectQuestionList } from "../../../lib/hooks"
import { StatusBar } from "../../../components/shared/StatusBar"
import { getListingStatusTag } from "../helpers"
import RequestChangesDialog from "./dialogs/RequestChangesDialog"
import CloseListingDialog from "./dialogs/CloseListingDialog"
import PublishListingDialog from "./dialogs/PublishListingDialog"
import LiveConfirmationDialog from "./dialogs/LiveConfirmationDialog"
import ListingApprovalDialog from "./dialogs/ListingApprovalDialog"
import SaveBeforeExitDialog from "./dialogs/SaveBeforeExitDialog"
import ListingVerification from "./sections/ListingVerification"

type ListingFormProps = {
  listing?: FormListing
  editMode?: boolean
  setListingName?: React.Dispatch<React.SetStateAction<string>>
}

export type SubmitFunction = (
  action: "redirect" | "continue" | "confirm",
  status?: ListingsStatusEnum,
  newData?: Partial<FormListing>
) => void

const getToast = (
  listing: FormListing,
  oldStatus: ListingsStatusEnum,
  newStatus: ListingsStatusEnum
) => {
  const toasts = {
    [ListingsStatusEnum.pendingReview]: t("listings.approval.submittedForReview"),
    [ListingsStatusEnum.changesRequested]: t("listings.listingStatus.changesRequested"),
    [ListingsStatusEnum.active]: t("listings.approval.listingPublished"),
    [ListingsStatusEnum.pending]: t("listings.approval.listingUnpublished"),
    [ListingsStatusEnum.closed]: t("listings.approval.listingClosed"),
    saved: t("listings.progressSaved"),
  }
  if (oldStatus !== newStatus) {
    if (!listing && newStatus === ListingsStatusEnum.pending) return toasts.saved
    return toasts[newStatus]
  }

  return toasts.saved
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ListingForm = ({ listing, editMode, setListingName }: ListingFormProps) => {
  const defaultValues = editMode ? listing : formDefaults
  const formMethods = useForm<FormListing>({
    defaultValues,
    shouldUnregister: false,
  })

  const router = useRouter()

  const { listingsService, profile } = useContext(AuthContext)
  const { addToast } = useContext(MessageContext)

  const [tabIndex, setTabIndex] = useState(0)
  const [alert, setAlert] = useState<AlertErrorType | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [units, setUnits] = useState<TempUnit[]>([])
  const [openHouseEvents, setOpenHouseEvents] = useState<TempEvent[]>([])
  const [preferences, setPreferences] = useState<MultiselectQuestion[]>(
    listingSectionQuestions(listing, MultiselectQuestionsApplicationSectionEnum.preferences)?.map(
      (listingPref) => {
        return { ...listingPref?.multiselectQuestions }
      }
    ) ?? []
  )
  const [programs, setPrograms] = useState<MultiselectQuestion[]>(
    listingSectionQuestions(listing, MultiselectQuestionsApplicationSectionEnum.programs)?.map(
      (listingProg) => {
        return { ...listingProg?.multiselectQuestions }
      }
    )
  )

  const [latLong, setLatLong] = useState<LatitudeLongitude>({
    latitude: listing?.listingsBuildingAddress?.latitude ?? null,
    longitude: listing?.listingsBuildingAddress?.longitude ?? null,
  })
  const [customMapPositionChosen, setCustomMapPositionChosen] = useState(
    listing?.customMapPin || false
  )
  const [activeFeatureFlags, setActiveFeatureFlags] = useState<FeatureFlag[]>(null)

  const setLatitudeLongitude = (latlong: LatitudeLongitude) => {
    if (!loading) {
      setLatLong(latlong)
    }
  }

  const [closeSaveDialog, setCloseSaveDialog] = useState(false)
  const [closeListingDialog, setCloseListingDialog] = useState(false)
  const [publishDialog, setPublishDialog] = useState(false)
  const [lotteryResultsDrawer, setLotteryResultsDrawer] = useState(false)
  const [listingIsAlreadyLiveDialog, setListingIsAlreadyLiveDialog] = useState(false)
  const [submitForApprovalDialog, setSubmitForApprovalDialog] = useState(false)
  const [requestChangesDialog, setRequestChangesDialog] = useState(false)

  useEffect(() => {
    if (listing?.units) {
      const tempUnits = listing.units.map((unit, i) => ({
        ...unit,
        tempId: i + 1,
      }))
      setUnits(tempUnits)
    }

    if (listing?.listingEvents) {
      setOpenHouseEvents(
        listing.listingEvents
          .filter((event) => event.type === ListingEventsTypeEnum.openHouse)
          .map((event) => {
            return {
              ...event,
              startTime: new Date(event.startTime),
              endTime: new Date(event.endTime),
            }
          })
          .sort((a, b) => (dayjs(a.startTime).isAfter(b.startTime) ? 1 : -1))
      )
    }
  }, [listing?.units, listing?.listingEvents, setUnits, setOpenHouseEvents])

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { getValues, setError, clearErrors, reset, watch } = formMethods

  const selectedJurisdiction = watch("jurisdictions.id")

  // Set the active feature flags depending on if/what jurisdiction is selected
  useEffect(() => {
    const newFeatureFlags = profile.jurisdictions?.reduce((featureFlags, juris) => {
      if (!selectedJurisdiction || selectedJurisdiction === juris.id) {
        // filter only the active feature flags
        const jurisFeatureFlags = juris.featureFlags?.filter((value) => value.active)
        const flags = [...featureFlags, ...jurisFeatureFlags]
        return [...new Set(flags)]
      }
      return featureFlags
    }, [])
    setActiveFeatureFlags(newFeatureFlags)
  }, [profile.jurisdictions, selectedJurisdiction])

  const triggerSubmitWithStatus: SubmitFunction = (action, status, newData) => {
    if (action !== "redirect" && status === ListingsStatusEnum.active) {
      if (listing?.status === ListingsStatusEnum.active) {
        setListingIsAlreadyLiveDialog(true)
      } else {
        setPublishDialog(true)
      }
      return
    }
    let formData = { ...defaultValues, ...getValues(), ...(newData || {}) }
    if (status) {
      formData = { ...formData, status }
    }
    void onSubmit(formData, action === "continue")
  }

  const onSubmit = useCallback(
    async (formData: FormListing, continueEditing: boolean) => {
      if (!loading) {
        try {
          setLoading(true)
          clearErrors()
          const successful = await formMethods.trigger()

          if (successful) {
            const dataPipeline = new ListingDataPipeline(formData, {
              preferences,
              programs,
              units,
              openHouseEvents,
              profile: profile,
              latLong,
              customMapPositionChosen,
            })
            const formattedData = await dataPipeline.run()
            let result
            if (editMode) {
              result = await listingsService.update({
                id: listing.id,
                body: { id: listing.id, ...(formattedData as unknown as ListingUpdate) },
              })
            } else {
              result = await listingsService.create({
                body: formattedData as unknown as ListingCreate,
              })
            }

            reset(formData)

            if (result) {
              addToast(getToast(listing, listing?.status, formattedData?.status), {
                variant: "success",
              })

              if (continueEditing) {
                setAlert(null)
                setListingName(result.name)
              } else {
                await router.push(`/listings/${result.id}`)
              }
            }
            setLoading(false)
          } else {
            setLoading(false)
            setAlert("form")
          }
        } catch (err) {
          reset(formData)
          setLoading(false)
          clearErrors()
          const { data } = err.response || {}
          if (data?.statusCode === 400) {
            data?.message?.forEach((errorMessage: string) => {
              const fieldName = errorMessage.split(" ")[0]
              const readableError = getReadableErrorMessage(errorMessage)
              if (readableError) {
                setError(fieldName, { message: readableError })
                if (fieldName === "buildingAddress" || fieldName === "buildingAddress.nested") {
                  const setIfEmpty = (
                    fieldName: string,
                    fieldValue: string,
                    errorMessage: string
                  ) => {
                    if (!fieldValue) {
                      setError(fieldName, { message: errorMessage })
                    }
                  }
                  const address = formData.listingsBuildingAddress
                  setIfEmpty(`buildingAddress.city`, address.city, readableError)
                  setIfEmpty(`buildingAddress.state`, address.state, readableError)
                  setIfEmpty(`buildingAddress.street`, address.street, readableError)
                  setIfEmpty(`buildingAddress.zipCode`, address.zipCode, readableError)
                }
              }
            })
            setAlert("form")
          } else if (data?.message === "email failed") {
            addToast(t("errors.alert.listingsApprovalEmailError"), { variant: "warn" })
            await router.push(`/listings/${formData.id}/`)
          } else setAlert("api")
        }
      }
    },
    [
      units,
      openHouseEvents,
      editMode,
      listingsService,
      listing,
      router,
      preferences,
      programs,
      latLong,
      customMapPositionChosen,
      clearErrors,
      loading,
      reset,
      setError,
      profile,
      addToast,
    ]
  )

  return loading === true ? null : (
    <>
      <LoadingOverlay isLoading={loading}>
        <>
          <StatusBar>{getListingStatusTag(listing?.status)}</StatusBar>

          <FormProvider {...formMethods}>
            <section className="bg-primary-lighter py-5">
              <div className="max-w-screen-xl px-5 mx-auto">
                {alert && (
                  <AlertBox className="mb-5" onClose={() => setAlert(null)} closeable type="alert">
                    {alert === "form" ? t("listings.fieldError") : t("errors.alert.badRequest")}
                  </AlertBox>
                )}

                <Form id="listing-form">
                  <div className="flex flex-row flex-wrap">
                    <div className="md:w-9/12 pb-28">
                      <Tabs
                        forceRenderTabPanel={true}
                        selectedIndex={tabIndex}
                        onSelect={(index) => setTabIndex(index)}
                      >
                        <Tabs.TabList>
                          <Tabs.Tab>Listing Details</Tabs.Tab>
                          <Tabs.Tab>Application Process</Tabs.Tab>
                        </Tabs.TabList>
                        <Tabs.TabPanel>
                          <ListingIntro jurisdictions={profile.jurisdictions} />
                          <ListingPhotos />
                          <BuildingDetails
                            listing={listing}
                            setLatLong={setLatitudeLongitude}
                            latLong={latLong}
                            customMapPositionChosen={customMapPositionChosen}
                            setCustomMapPositionChosen={setCustomMapPositionChosen}
                          />
                          <CommunityType listing={listing} />
                          <Units
                            units={units}
                            setUnits={setUnits}
                            disableUnitsAccordion={listing?.disableUnitsAccordion}
                            featureFlags={activeFeatureFlags}
                          />
                          <SelectAndOrder
                            addText={t("listings.addPreference")}
                            drawerTitle={t("listings.addPreferences")}
                            drawerSubtitle={
                              process.env.showLottery && listing?.lotteryOptIn
                                ? t("listings.lotteryPreferenceSubtitle")
                                : null
                            }
                            editText={t("listings.editPreferences")}
                            listingData={preferences || []}
                            setListingData={setPreferences}
                            subtitle={t("listings.sections.housingPreferencesSubtext")}
                            title={t("listings.sections.housingPreferencesTitle")}
                            drawerButtonText={t("listings.selectPreferences")}
                            dataFetcher={useJurisdictionalMultiselectQuestionList}
                            formKey={"preference"}
                            applicationSection={
                              MultiselectQuestionsApplicationSectionEnum.preferences
                            }
                          />
                          <SelectAndOrder
                            addText={"Add program"}
                            drawerTitle={"Add programs"}
                            editText={"Edit programs"}
                            listingData={programs || []}
                            setListingData={setPrograms}
                            subtitle={
                              "Tell us about any additional housing programs related to this listing."
                            }
                            title={"Housing Programs"}
                            drawerButtonText={"Select programs"}
                            dataFetcher={useJurisdictionalMultiselectQuestionList}
                            formKey={"program"}
                            applicationSection={MultiselectQuestionsApplicationSectionEnum.programs}
                          />
                          <AdditionalFees existingUtilities={listing?.listingUtilities} />
                          <BuildingFeatures existingFeatures={listing?.listingFeatures} />
                          <AdditionalEligibility defaultText={listing?.rentalAssistance} />
                          <BuildingSelectionCriteria />
                          <AdditionalDetails />
                          <ListingVerification />
                          <div className="text-right -mr-8 -mt-8 relative" style={{ top: "7rem" }}>
                            <Button
                              id="applicationProcessButton"
                              type="button"
                              variant="primary-outlined"
                              tailIcon={
                                <Icon>
                                  <ChevronRightIcon />
                                </Icon>
                              }
                              onClick={() => {
                                setTabIndex(1)
                                setTimeout(() => window.scroll({ top: 0, behavior: "smooth" }))
                              }}
                            >
                              Application Process
                            </Button>
                          </div>
                        </Tabs.TabPanel>
                        <Tabs.TabPanel>
                          <RankingsAndResults
                            listing={listing}
                            isAdmin={profile?.userRoles.isAdmin}
                          />
                          <LeasingAgent />
                          <ApplicationTypes listing={listing} />
                          <ApplicationAddress listing={listing} />
                          <ApplicationDates
                            listing={listing}
                            openHouseEvents={openHouseEvents}
                            setOpenHouseEvents={setOpenHouseEvents}
                          />

                          <div className="-ml-8 -mt-8 relative" style={{ top: "7rem" }}>
                            <Button
                              type="button"
                              variant="primary-outlined"
                              leadIcon={
                                <Icon>
                                  <ChevronLeftIcon />
                                </Icon>
                              }
                              onClick={() => {
                                setTabIndex(0)
                                setTimeout(() => window.scroll({ top: 0, behavior: "smooth" }))
                              }}
                            >
                              Listing Details
                            </Button>
                          </div>
                        </Tabs.TabPanel>
                      </Tabs>

                      {listing?.status === ListingsStatusEnum.closed &&
                        (!listing?.lotteryOptIn || !process.env.showLottery) && (
                          <LotteryResults
                            submitCallback={(data) => {
                              triggerSubmitWithStatus("redirect", ListingsStatusEnum.closed, data)
                            }}
                            drawerState={lotteryResultsDrawer}
                            showDrawer={(toggle: boolean) => setLotteryResultsDrawer(toggle)}
                          />
                        )}
                    </div>

                    <aside className="w-full md:w-3/12 md:pl-6">
                      <ListingFormActions
                        type={editMode ? ListingFormActionsType.edit : ListingFormActionsType.add}
                        showSaveBeforeExitDialog={() => setCloseSaveDialog(true)}
                        showCloseListingModal={() => setCloseListingDialog(true)}
                        showLotteryResultsDrawer={() => setLotteryResultsDrawer(true)}
                        showRequestChangesModal={() => setRequestChangesDialog(true)}
                        showSubmitForApprovalModal={() => setSubmitForApprovalDialog(true)}
                        submitFormWithStatus={triggerSubmitWithStatus}
                      />
                    </aside>
                  </div>
                </Form>
              </div>
            </section>
          </FormProvider>
        </>
      </LoadingOverlay>

      <SaveBeforeExitDialog
        isOpen={closeSaveDialog}
        setOpen={setCloseSaveDialog}
        currentListingStatus={listing?.status}
        submitFormWithStatus={triggerSubmitWithStatus}
        listingDetailURL={`/${listing ? `listings/${listing?.id}` : ""}`}
      />

      <CloseListingDialog
        isOpen={closeListingDialog}
        setOpen={setCloseListingDialog}
        submitFormWithStatus={triggerSubmitWithStatus}
      />

      <PublishListingDialog
        isOpen={publishDialog}
        setOpen={setPublishDialog}
        submitFormWithStatus={triggerSubmitWithStatus}
      />

      <LiveConfirmationDialog
        isOpen={listingIsAlreadyLiveDialog}
        setOpen={setListingIsAlreadyLiveDialog}
        submitFormWithStatus={triggerSubmitWithStatus}
      />

      <ListingApprovalDialog
        isOpen={submitForApprovalDialog}
        setOpen={setSubmitForApprovalDialog}
        submitFormWithStatus={triggerSubmitWithStatus}
      />

      <RequestChangesDialog
        defaultValue={listing?.requestedChanges}
        modalIsOpen={requestChangesDialog}
        setModalIsOpen={setRequestChangesDialog}
        submitFormWithStatus={triggerSubmitWithStatus}
      />
    </>
  )
}

export default ListingForm

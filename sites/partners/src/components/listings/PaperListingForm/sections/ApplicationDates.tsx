import React, { useState, useMemo, useContext } from "react"
import { useFormContext } from "react-hook-form"
import { getDetailFieldDate, getDetailFieldTime } from "../../PaperListingDetails/sections/helpers"
import dayjs from "dayjs"
import {
  t,
  DateField,
  TimeField,
  MinimalTable,
  FieldGroup,
  Field,
  Select,
  maskNumber,
} from "@bloom-housing/ui-components"
import { Button, Dialog, Drawer, Link, Grid, FieldValue } from "@bloom-housing/ui-seeds"
import { FormListing, TempEvent } from "../../../../lib/listings/formTypes"
import { OpenHouseForm } from "../OpenHouseForm"
import SectionWithGrid from "../../../shared/SectionWithGrid"
import {
  MarketingTypeEnum,
  MarketingSeasonEnum,
  FeatureFlagEnum,
} from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import { AuthContext } from "@bloom-housing/shared-helpers"
import { fieldMessage, fieldHasError } from "../../../../lib/helpers"

type ApplicationDatesProps = {
  openHouseEvents: TempEvent[]
  setOpenHouseEvents: (events: TempEvent[]) => void
  listing?: FormListing
}

const ApplicationDates = ({
  listing,
  openHouseEvents,
  setOpenHouseEvents,
}: ApplicationDatesProps) => {
  const openHouseHeaders = {
    date: "t.date",
    startTime: "t.startTime",
    endTime: "t.endTime",
    url: "t.link",
    action: "",
  }

  const { doJurisdictionsHaveFeatureFlagOn } = useContext(AuthContext)

  const enableMarketingStatus = doJurisdictionsHaveFeatureFlagOn(
    FeatureFlagEnum.enableMarketingStatus,
    listing?.jurisdictions?.id
  )

  const openHouseTableData = useMemo(() => {
    return openHouseEvents.map((event) => {
      const { startTime, endTime, url } = event

      return {
        date: { content: startTime && getDetailFieldDate(startTime) },
        startTime: { content: startTime && getDetailFieldTime(startTime) },
        endTime: { content: endTime && getDetailFieldTime(endTime) },
        url: {
          content: url?.length ? <Link href={url}>{t("t.url")}</Link> : t("t.n/a"),
        },
        action: {
          content: (
            <div className="flex gap-3">
              <Button
                type="button"
                size="sm"
                className="font-semibold"
                onClick={() => setDrawerOpenHouse(event)}
                variant="text"
              >
                {t("t.edit")}
              </Button>
              <Button
                type="button"
                size="sm"
                className="font-semibold text-alert"
                onClick={() => setModalDeleteOpenHouse(event)}
                variant="text"
              >
                {t("t.delete")}
              </Button>
            </div>
          ),
        },
      }
    })
  }, [openHouseEvents])

  const formMethods = useFormContext()

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { errors, register, setValue, watch, clearErrors } = formMethods

  const [drawerOpenHouse, setDrawerOpenHouse] = useState<TempEvent | boolean>(false)
  const [modalDeleteOpenHouse, setModalDeleteOpenHouse] = useState<TempEvent | null>(null)

  const onOpenHouseEventsSubmit = (event: TempEvent) => {
    setDrawerOpenHouse(false)

    const eventsWithoutEdited = openHouseEvents.filter((item) => {
      return event.id ? event.id !== item.id : event.tempId !== item.tempId
    })

    setOpenHouseEvents(
      [...eventsWithoutEdited, event].sort((a, b) =>
        dayjs(a.startTime).isAfter(b.startTime) ? 1 : -1
      )
    )
  }

  const onOpenHouseEventDelete = (eventToDelete: TempEvent) => {
    const newEvents = openHouseEvents.filter((event) => event !== eventToDelete)
    setOpenHouseEvents(newEvents)
    setModalDeleteOpenHouse(null)
  }

  const hasDueDateError = errors?.applicationDueDate || errors?.applicationDueDateField

  const marketingTypeChoice = watch("marketingType")

  return (
    <>
      <hr className="spacer-section-above spacer-section" />
      <SectionWithGrid
        heading={t("listings.sections.applicationDatesTitle")}
        subheading={t("listings.sections.applicationDatesSubtitle")}
      >
        <Grid.Row columns={2}>
          <Grid.Cell>
            <DateField
              label={t("listings.applicationDeadline")}
              name={"applicationDueDateField"}
              id={"applicationDueDateField"}
              register={register}
              setValue={setValue}
              watch={watch}
              error={
                hasDueDateError && {
                  month: hasDueDateError,
                  day: hasDueDateError,
                  year: hasDueDateError,
                }
              }
              note={t("listings.whenApplicationsClose")}
              defaultDate={{
                month: listing?.applicationDueDate
                  ? dayjs(new Date(listing?.applicationDueDate)).format("MM")
                  : null,
                day: listing?.applicationDueDate
                  ? dayjs(new Date(listing?.applicationDueDate)).format("DD")
                  : null,
                year: listing?.applicationDueDate
                  ? dayjs(new Date(listing?.applicationDueDate)).format("YYYY")
                  : null,
              }}
            />
          </Grid.Cell>
          <Grid.Cell>
            <TimeField
              label={t("listings.applicationDueTime")}
              name={"applicationDueTimeField"}
              id={"applicationDueTimeField"}
              register={register}
              setValue={setValue}
              watch={watch}
              error={errors?.applicationDueDate || errors?.applicationDueTimeField}
              defaultValues={{
                hours: listing?.applicationDueDate
                  ? dayjs(new Date(listing?.applicationDueDate)).format("hh")
                  : null,
                minutes: listing?.applicationDueDate
                  ? dayjs(new Date(listing?.applicationDueDate)).format("mm")
                  : null,
                seconds: listing?.applicationDueDate
                  ? dayjs(new Date(listing?.applicationDueDate)).format("ss")
                  : null,
                period: listing?.applicationDueDate
                  ? new Date(listing?.applicationDueDate).getHours() >= 12
                    ? "pm"
                    : "am"
                  : "pm",
              }}
            />
          </Grid.Cell>
        </Grid.Row>
        {enableMarketingStatus && (
          <Grid.Row columns={2}>
            <Grid.Cell>
              <FieldValue label={t("listings.marketingSection.status")}>
                <FieldGroup
                  name="marketingType"
                  type="radio"
                  register={register}
                  fields={[
                    {
                      label: t("listings.marketing"),
                      value: MarketingTypeEnum.marketing,
                      id: "marketingStatusMarketing",
                      defaultChecked:
                        !listing?.marketingType ||
                        listing?.marketingType === MarketingTypeEnum.marketing,
                    },
                    {
                      label: t("listings.underConstruction"),
                      value: MarketingTypeEnum.comingSoon,
                      id: "marketingStatusComingSoon",
                      defaultChecked: listing?.marketingType === MarketingTypeEnum.comingSoon,
                    },
                  ]}
                />
              </FieldValue>
            </Grid.Cell>
            {marketingTypeChoice === MarketingTypeEnum.comingSoon && (
              <Grid.Cell>
                <div className={"flex flex-col"}>
                  <p className={"field-label pb-0"}>{t("listings.marketingSection.date")}</p>
                  <div className={"flex items-baseline h-auto"}>
                    <div className="w-2/3">
                      <Select
                        id="marketingSeason"
                        name="marketingSeason"
                        defaultValue={listing?.marketingSeason}
                        register={register}
                        label={t("listings.marketingSection.seasons")}
                        labelClassName="sr-only"
                        controlClassName="control"
                        options={[
                          "",
                          MarketingSeasonEnum.spring,
                          MarketingSeasonEnum.summer,
                          MarketingSeasonEnum.fall,
                          MarketingSeasonEnum.winter,
                        ]}
                        keyPrefix="seasons"
                      />
                    </div>

                    <Field
                      name={"marketingStartDate"}
                      id={"marketingStartDate"}
                      placeholder={t("account.settings.placeholders.year")}
                      defaultValue={
                        listing?.marketingDate ? dayjs(listing.marketingDate).year() : null
                      }
                      register={register}
                      validation={{
                        validate: {
                          yearRange: (value: string) => {
                            if (!value?.length) return true

                            const numVal = parseInt(value)
                            if (isNaN(numVal)) return false
                            return !(numVal < 1900 || numVal > dayjs().year() + 10)
                          },
                        },
                      }}
                      inputProps={{
                        onChange: (e) => {
                          fieldHasError(errors?.marketingDate) && clearErrors("marketingDate")
                          fieldHasError(errors?.marketingStartDate) &&
                            clearErrors("marketingStartDate")
                          if (!setValue) return
                          setValue("marketingStartDate", maskNumber(e.target.value))
                        },
                        maxLength: 4,
                      }}
                      className="w-1/3"
                      error={
                        fieldHasError(errors?.marketingDate) ||
                        fieldHasError(errors?.marketingStartDate)
                      }
                      errorMessage={fieldMessage(errors?.marketingDate) || t("errors.dateError")}
                    />
                  </div>
                  <p className="field-sub-note">{t("listings.marketingSection.dateSubtitle")}</p>
                </div>
              </Grid.Cell>
            )}
          </Grid.Row>
        )}
        <Grid.Row>
          <Grid.Cell className="grid-inset-section">
            {!!openHouseTableData.length && (
              <div className="mb-5">
                <MinimalTable headers={openHouseHeaders} data={openHouseTableData} />
              </div>
            )}

            <Button
              id="addOpenHouseButton"
              type="button"
              variant="primary-outlined"
              size="sm"
              onClick={() => setDrawerOpenHouse(true)}
            >
              {t("listings.sections.addOpenHouse")}
            </Button>
          </Grid.Cell>
        </Grid.Row>
      </SectionWithGrid>

      <Drawer
        isOpen={!!drawerOpenHouse}
        onClose={() => setDrawerOpenHouse(false)}
        ariaLabelledBy="application-dates-drawer-header"
      >
        <Drawer.Header id="application-dates-drawer-header">
          {t("listings.sections.addOpenHouse")}
        </Drawer.Header>
        <OpenHouseForm
          onSubmit={onOpenHouseEventsSubmit}
          currentEvent={(drawerOpenHouse as TempEvent) || undefined}
        />
      </Drawer>

      <Dialog
        isOpen={!!modalDeleteOpenHouse}
        ariaLabelledBy="application-dates-dialog-header"
        ariaDescribedBy="application-dates-dialog-content"
        onClose={() => setModalDeleteOpenHouse(null)}
      >
        <Dialog.Header id="application-dates-dialog-header">
          {t("listings.events.deleteThisEvent")}
        </Dialog.Header>
        <Dialog.Content id="application-dates-dialog-content">
          {t("listings.events.deleteConf")}
        </Dialog.Content>
        <Dialog.Footer>
          <Button
            variant="alert"
            onClick={() => onOpenHouseEventDelete(modalDeleteOpenHouse)}
            size="sm"
          >
            {t("t.delete")}
          </Button>
          <Button
            onClick={() => {
              setModalDeleteOpenHouse(null)
            }}
            variant="primary-outlined"
            size="sm"
          >
            {t("t.cancel")}
          </Button>
        </Dialog.Footer>
      </Dialog>
    </>
  )
}

export default ApplicationDates

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import {
  Jurisdiction,
  Listing,
  ListingEventsTypeEnum,
  ListingsStatusEnum,
} from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import { t } from "@bloom-housing/ui-components"
import { pdfUrlFromListingEvents } from "@bloom-housing/shared-helpers"
import { Heading } from "@bloom-housing/ui-seeds"
import { ErrorPage } from "../../pages/_error"
import { getListingApplicationStatusSeeds } from "../../lib/helpers"
import {
  getAdditionalInformation,
  getAmiValues,
  getEligibilitySections,
  getFeatures,
  getPaperApplications,
  getUtilitiesIncluded,
  PaperApplicationDialog,
} from "./ListingViewSeedsHelpers"
import { AdditionalFees } from "./listing_sections/AdditionalFees"
import { AdditionalInformation } from "./listing_sections/AdditionalInformation"
import { Apply } from "./listing_sections/Apply"
import { Availability } from "./listing_sections/Availability"
import { DateSection } from "./listing_sections/DateSection"
import { DueDate } from "./listing_sections/DueDate"
import { Eligibility } from "./listing_sections/Eligibility"
import { Features } from "./listing_sections/Features"
import { FurtherInformation } from "./listing_sections/FurtherInformation"
import { InfoCard } from "./listing_sections/InfoCard"
import { LeasingAgent } from "./listing_sections/LeasingAgent"
import { LotteryResults } from "./listing_sections/LotteryResults"
import { MainDetails } from "./listing_sections/MainDetails"
import { Neighborhood } from "./listing_sections/Neighborhood"
import { RentSummary } from "./listing_sections/RentSummary"
import { UnitSummaries } from "./listing_sections/UnitSummaries"
import styles from "./ListingViewSeeds.module.scss"

interface ListingProps {
  jurisdiction?: Jurisdiction
  listing: Listing
  preview?: boolean
}

export const ListingViewSeeds = ({ jurisdiction, listing, preview }: ListingProps) => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { register, watch } = useForm()

  const [showDownloadModal, setShowDownloadModal] = useState(false)

  if (!listing) {
    return <ErrorPage />
  }

  const lotteryResultsEvent = listing.listingEvents?.find(
    (event) => event.type === ListingEventsTypeEnum.lotteryResults
  )
  const paperApplications = getPaperApplications(listing.applicationMethods)
  const paperApplicationURL: string = watch(
    "paperApplicationLanguage",
    paperApplications?.length ? paperApplications[0].fileURL : undefined
  )
  const statusContent = getListingApplicationStatusSeeds(listing)

  const OpenHouses = (
    <DateSection
      heading={t("listings.openHouseEvent.header")}
      events={listing.listingEvents?.filter(
        (event) => event.type === ListingEventsTypeEnum.openHouse
      )}
    />
  )

  const LotteryEvent = (
    <>
      {(!lotteryResultsEvent || listing.status === ListingsStatusEnum.active) && (
        <DateSection
          heading={t("listings.publicLottery.header")}
          events={listing.listingEvents?.filter(
            (event) => event.type === ListingEventsTypeEnum.publicLottery
          )}
        />
      )}
    </>
  )

  const ReferralApplication = (
    <>
      {listing.referralApplication && (
        <FurtherInformation
          instructions={listing.referralApplication.externalReference}
          phoneNumber={listing.referralApplication.phoneNumber}
        />
      )}
    </>
  )

  const WhatToExpect = (
    <>
      {listing.whatToExpect && (
        <InfoCard heading={t("whatToExpect.label")}>
          <div>{listing.whatToExpect}</div>
        </InfoCard>
      )}
    </>
  )

  const UnitFeatures = (
    <>
      <Heading size={"lg"} className={"seeds-m-be-header"} priority={3}>
        {t("t.unitFeatures")}
      </Heading>
      <UnitSummaries
        disableUnitsAccordion={listing.disableUnitsAccordion}
        units={listing.units}
        unitSummary={listing.unitsSummarized?.byUnitType}
      />
      <AdditionalFees
        applicationFee={listing.applicationFee}
        costsNotIncluded={listing.costsNotIncluded}
        depositHelperText={listing.depositHelperText}
        depositMax={listing.depositMax}
        depositMin={listing.depositMin}
        utilitiesIncluded={
          jurisdiction?.featureFlags?.some(
            (flag) => flag.name === "enableUtilitiesIncluded" && flag.active
          )
            ? getUtilitiesIncluded(listing)
            : []
        }
      />
    </>
  )

  const ApplyBar = (
    <>
      <LotteryResults
        listingStatus={listing.status}
        lotteryResultsPdfUrl={pdfUrlFromListingEvents(
          [lotteryResultsEvent],
          ListingEventsTypeEnum.lotteryResults,
          process.env.cloudinaryCloudName
        )}
        lotteryResultsEvent={lotteryResultsEvent}
      />
      {OpenHouses}
      <Apply listing={listing} preview={preview} setShowDownloadModal={setShowDownloadModal} />
      {LotteryEvent}
      {ReferralApplication}
      {WhatToExpect}
      <LeasingAgent
        address={listing.listingsLeasingAgentAddress}
        email={listing.leasingAgentEmail}
        name={listing.leasingAgentName}
        officeHours={listing.leasingAgentOfficeHours}
        phone={listing.leasingAgentPhone}
        title={listing.leasingAgentTitle}
      />
    </>
  )

  return (
    <article className={styles["listing-view"]}>
      <div className={styles["content-wrapper"]}>
        <div className={styles["left-bar"]}>
          <MainDetails
            listing={listing}
            dueDateContent={[statusContent?.content, statusContent?.subContent]}
          />
          <RentSummary
            amiValues={getAmiValues(listing)}
            reviewOrderType={listing.reviewOrderType}
            unitsSummarized={listing.unitsSummarized}
          />
          <div className={styles["main-content"]}>
            <div className={styles["hide-desktop"]}>{ApplyBar}</div>
            <Eligibility eligibilitySections={getEligibilitySections(listing)} />
            <Features features={getFeatures(listing, jurisdiction)}>{UnitFeatures}</Features>
            <Neighborhood address={listing.listingsBuildingAddress} name={listing.name} />
            <AdditionalInformation additionalInformation={getAdditionalInformation(listing)} />
          </div>
        </div>
        <div className={`${styles["right-bar"]} ${styles["hide-mobile"]}`}>
          <DueDate content={[statusContent?.content, statusContent?.subContent]} />
          <Availability
            reservedCommunityDescription={listing.reservedCommunityDescription}
            reservedCommunityType={listing.reservedCommunityTypes}
            reviewOrder={listing.reviewOrderType}
            status={listing.status}
            unitsAvailable={listing.unitsAvailable}
            waitlistOpenSpots={listing.waitlistOpenSpots}
          />
          {ApplyBar}
        </div>
      </div>
      <PaperApplicationDialog
        listingName={listing.name}
        paperApplications={paperApplications}
        paperApplicationUrl={paperApplicationURL}
        register={register}
        setShowDialog={setShowDownloadModal}
        showDialog={showDownloadModal}
      />
    </article>
  )
}

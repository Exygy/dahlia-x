import * as React from "react"
import { Card, HeadingGroup } from "@bloom-housing/ui-seeds"
import {
  IdDTO,
  ListingsStatusEnum,
  ReviewOrderTypeEnum,
} from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import { t } from "@bloom-housing/ui-components"
import { getReservedTitle } from "../ListingViewSeedsHelpers"
import listingStyles from "../ListingViewSeeds.module.scss"
import styles from "./Availability.module.scss"

type AvailabilityProps = {
  reservedCommunityDescription: string
  reservedCommunityType: IdDTO
  reviewOrder: ReviewOrderTypeEnum
  status: ListingsStatusEnum
  unitsAvailable: number
  waitlistOpenSpots: number
}

export const getAvailabilitySubheading = (
  waitlistOpenSpots: number,
  unitsAvailable: number
): string => {
  if (waitlistOpenSpots) {
    return `${waitlistOpenSpots} ${t("listings.waitlist.openSlots")}`
  }
  if (unitsAvailable) {
    return `${unitsAvailable} ${
      unitsAvailable === 1 ? t("listings.vacantUnit") : t("listings.vacantUnits")
    }`
  }
  return null
}

export const getAvailabilityContent = (reviewOrderType: ReviewOrderTypeEnum) => {
  switch (reviewOrderType) {
    case ReviewOrderTypeEnum.waitlist:
      return t("listings.waitlist.submitForWaitlist")
    case ReviewOrderTypeEnum.firstComeFirstServe:
      return t("listings.eligibleApplicants.FCFS")
    default:
      return t("listings.availableUnitsDescription")
  }
}

export const Availability = ({
  reservedCommunityDescription,
  reservedCommunityType,
  reviewOrder,
  status,
  unitsAvailable,
  waitlistOpenSpots,
}: AvailabilityProps) => {
  if (status === ListingsStatusEnum.closed && !reservedCommunityType) return
  return (
    <Card
      className={`${listingStyles["muted-card"]} ${listingStyles["mobile-full-width-card"]} seeds-m-bs-content`}
    >
      {reservedCommunityType && (
        <Card.Section divider="inset">
          <HeadingGroup
            heading={getReservedTitle(reservedCommunityType)}
            subheading={t(`listings.reservedCommunityTypes.${reservedCommunityType.name}`)}
            size={"lg"}
            className={`${listingStyles["heading-group"]} ${styles["emphasized-heading-group"]}`}
          />
          <p>{reservedCommunityDescription}</p>
        </Card.Section>
      )}
      {status !== ListingsStatusEnum.closed && (
        <Card.Section>
          <HeadingGroup
            heading={
              reviewOrder === ReviewOrderTypeEnum.waitlist
                ? t("listings.waitlist.isOpen")
                : t("listings.vacantUnitsAvailable")
            }
            subheading={getAvailabilitySubheading(waitlistOpenSpots, unitsAvailable)}
            size={"lg"}
            className={`${listingStyles["heading-group"]} ${styles["emphasized-heading-group"]}`}
          />
          <p>{getAvailabilityContent(reviewOrder)}</p>
        </Card.Section>
      )}
    </Card>
  )
}

import dayjs from "dayjs"
import {
  Address,
  Listing,
  ListingReviewOrder,
  UnitsSummarized,
  ListingStatus,
} from "@bloom-housing/backend-core/types"
import {
  t,
  ListingCard,
  ApplicationStatusType,
  getSummariesTable,
  StatusBarType,
} from "@bloom-housing/ui-components"
import { imageUrlFromListing } from "@bloom-housing/shared-helpers"

export const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export const getGenericAddress = (bloomAddress: Address) => {
  return bloomAddress
    ? {
        city: bloomAddress.city,
        street: bloomAddress.street,
        street2: bloomAddress.street2,
        state: bloomAddress.state,
        zipCode: bloomAddress.zipCode,
        latitude: bloomAddress.latitude,
        longitude: bloomAddress.longitude,
        placeName: bloomAddress.placeName,
      }
    : null
}

export const disableContactFormOption = (id: string, noPhone: boolean, noEmail: boolean) => {
  if ((id === "phone" || id === "text") && noPhone) {
    return true
  } else if (id === "email" && noEmail) {
    return true
  }
  return false
}

export const openInFuture = (listing: Listing) => {
  const nowTime = dayjs()
  return listing.applicationOpenDate && nowTime < dayjs(listing.applicationOpenDate)
}

const getListingCardSubtitle = (address: Address) => {
  const { street, city, state, zipCode } = address || {}
  return address ? `${street}, ${city} ${state}, ${zipCode}` : null
}

const getListingTableData = (unitsSummarized: UnitsSummarized) => {
  return unitsSummarized !== undefined ? getSummariesTable(unitsSummarized.byUnitTypeAndRent) : []
}

export const getListingApplicationStatus = (listing: Listing): StatusBarType => {
  let content = ""
  let subContent = ""
  let formattedDate = ""
  let status = ApplicationStatusType.Open

  if (openInFuture(listing)) {
    const date = listing.applicationOpenDate
    const openDate = dayjs(date)
    formattedDate = openDate.format("MMM D, YYYY")
    content = t("listings.applicationOpenPeriod")
  } else {
    if (listing.status === ListingStatus.closed) {
      status = ApplicationStatusType.Closed
      content = t("listings.applicationsClosed")
    } else if (listing.applicationDueDate) {
      const dueDate = dayjs(listing.applicationDueDate)
      formattedDate = dueDate.format("MMM DD, YYYY")
      formattedDate = formattedDate + ` ${t("t.at")} ` + dueDate.format("h:mmA")

      // if due date is in future, listing is open
      if (dayjs() < dueDate) {
        content = t("listings.applicationDeadline")
      } else {
        status = ApplicationStatusType.Closed
        content = t("listings.applicationsClosed")
      }
    }
  }

  if (formattedDate != "") {
    content = content + `: ${formattedDate}`
  }

  if (listing.reviewOrderType === ListingReviewOrder.firstComeFirstServe) {
    subContent = content
    content = t("listings.applicationFCFS")
  }

  return {
    status,
    content,
    subContent,
  }
}

export const getListings = (listings) => {
  const unitSummariesHeaders = {
    unitType: "t.unitType",
    minimumIncome: "t.minimumIncome",
    rent: "t.rent",
  }
  return listings.map((listing: Listing, index) => {
    return (
      <ListingCard
        key={index}
        imageCardProps={{
          imageUrl:
            imageUrlFromListing(listing, parseInt(process.env.listingPhotoSize || "1302")) || "",
          href: `/listing/${listing.id}/${listing.urlSlug}`,
          tags: listing.reservedCommunityType
            ? [
                {
                  text: t(`listings.reservedCommunityTypes.${listing.reservedCommunityType.name}`),
                },
              ]
            : undefined,
          statuses: [getListingApplicationStatus(listing)],
          description: listing.name,
        }}
        tableProps={{
          headers: unitSummariesHeaders,
          data: getListingTableData(listing.unitsSummarized),
          responsiveCollapse: true,
          cellClassName: "px-5 py-3",
        }}
        footerButtons={[
          { text: t("t.seeDetails"), href: `/listing/${listing.id}/${listing.urlSlug}` },
        ]}
        contentProps={{
          contentHeader: { text: listing.name },
          contentSubheader: { text: getListingCardSubtitle(listing.buildingAddress) },
          tableHeader: { text: listing.showWaitlist ? t("listings.waitlist.open") : null },
        }}
      />
    )
  })
}

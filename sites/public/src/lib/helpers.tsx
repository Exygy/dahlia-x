import React from "react"
import dayjs from "dayjs"
import {
  t,
  ListingCard,
  ApplicationStatusType,
  StatusBarType,
  AppearanceStyleType,
} from "@bloom-housing/ui-components"
import {
  imageUrlFromListing,
  getSummariesTable,
  IMAGE_FALLBACK_URL,
  cleanMultiselectString,
} from "@bloom-housing/shared-helpers"
import {
  Address,
  ApplicationMultiselectQuestion,
  Jurisdiction,
  Listing,
  ListingsStatusEnum,
  ReviewOrderTypeEnum,
  UnitsSummarized,
} from "@bloom-housing/shared-helpers/src/types/backend-swagger"

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
  if (id === "phone" || id === "text") {
    return noPhone
  }
  return id === "email" && noEmail
}

export const openInFuture = (listing: Listing) => {
  const nowTime = dayjs()
  return listing.applicationOpenDate && nowTime < dayjs(listing.applicationOpenDate)
}

const getListingCardSubtitle = (address: Address) => {
  const { street, city, state, zipCode } = address || {}
  return address ? `${street}, ${city} ${state}, ${zipCode}` : null
}

export const getListingTableData = (
  unitsSummarized: UnitsSummarized,
  listingReviewOrder: ReviewOrderTypeEnum
) => {
  return unitsSummarized !== undefined
    ? getSummariesTable(unitsSummarized.byUnitTypeAndRent, listingReviewOrder)
    : []
}

export const getListingApplicationStatus = (listing: Listing): StatusBarType => {
  if (!listing) return
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
    if (listing.status === ListingsStatusEnum.closed) {
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

  if (listing.reviewOrderType === ReviewOrderTypeEnum.firstComeFirstServe) {
    subContent = content
    content = t("listings.applicationFCFS")
  }

  if (listing.reviewOrderType === ReviewOrderTypeEnum.waitlist) {
    subContent = content
    content = t("listings.waitlist.open")
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

  const generateTableSubHeader = (listing) => {
    if (listing.reviewOrderType !== ReviewOrderTypeEnum.waitlist) {
      return {
        content: t("listings.availableUnits"),
        styleType: AppearanceStyleType.success,
        isPillType: true,
      }
    } else if (listing.reviewOrderType === ReviewOrderTypeEnum.waitlist) {
      return {
        content: t("listings.waitlist.open"),
        styleType: AppearanceStyleType.primary,
        isPillType: true,
      }
    }
    return null
  }
  return listings.map((listing: Listing, index) => {
    return (
      <ListingCard
        key={index}
        imageCardProps={{
          imageUrl: imageUrlFromListing(listing, parseInt(process.env.listingPhotoSize))[0],
          tags: listing.reservedCommunityTypes
            ? [
                {
                  text: t(`listings.reservedCommunityTypes.${listing.reservedCommunityTypes.name}`),
                },
              ]
            : undefined,
          statuses: [getListingApplicationStatus(listing)],
          description: listing.name,
          fallbackImageUrl: IMAGE_FALLBACK_URL,
        }}
        tableProps={{
          headers: unitSummariesHeaders,
          data: getListingTableData(listing.unitsSummarized, listing.reviewOrderType),
          responsiveCollapse: true,
          cellClassName: "px-5 py-3",
        }}
        footerButtons={[
          {
            text: t("t.seeDetails"),
            href: `/listing/${listing.id}/${listing.urlSlug}`,
            ariaHidden: true,
          },
        ]}
        contentProps={{
          contentHeader: {
            content: listing.name,
            href: `/listing/${listing.id}/${listing.urlSlug}`,
          },
          contentSubheader: { content: getListingCardSubtitle(listing.listingsBuildingAddress) },
          tableHeader: generateTableSubHeader(listing),
        }}
      />
    )
  })
}

export const untranslateMultiselectQuestion = (
  data: ApplicationMultiselectQuestion[],
  listing: Listing
) => {
  const multiselectQuestions = listing?.listingMultiselectQuestions ?? []

  data.forEach((datum) => {
    const question = multiselectQuestions.find(
      (elem) =>
        elem.multiselectQuestions.text === datum.key ||
        elem.multiselectQuestions.untranslatedText === datum.key
    )?.multiselectQuestions

    if (question) {
      datum.key = question.untranslatedText ?? question.text

      if (datum.options) {
        datum.options.forEach((option) => {
          const selectedOption = question.options.find((elem) => {
            return cleanMultiselectString(elem.text) === cleanMultiselectString(option.key)
          })
          if (selectedOption) {
            option.key = selectedOption.untranslatedText ?? selectedOption.text
          } else if (
            cleanMultiselectString(question?.optOutText) === cleanMultiselectString(option.key)
          ) {
            option.key = question.untranslatedOptOutText ?? question.optOutText
          }

          if (option.extraData) {
            option.extraData.forEach((extra) => {
              if (!extra.key) {
                extra.key = selectedOption.untranslatedText ?? selectedOption.text
              }
            })
          }
        })
      }
    }
  })
}

export const downloadExternalPDF = async (fileURL: string, fileName: string) => {
  try {
    await fetch(fileURL, {
      method: "GET",
      headers: {
        "Content-Type": "application/pdf",
      },
    })
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(new Blob([blob]))
        const link = document.createElement("a")
        link.href = url
        link.target = "_blank"
        link.setAttribute("download", `${fileName}.pdf`)

        document.body.appendChild(link)
        link.click()
        link.parentNode.removeChild(link)
      })
  } catch (err) {
    console.log(err)
  }
}

export const isFeatureFlagOn = (jurisdiction: Jurisdiction, featureFlag: string) => {
  return jurisdiction.featureFlags?.some((flag) => flag.name === featureFlag && flag.active)
}

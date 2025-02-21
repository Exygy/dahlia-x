import * as React from "react"
import {
  Listing,
  ReviewOrderTypeEnum,
} from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import { Heading, Link, Tag } from "@bloom-housing/ui-seeds"
import { TagVariant } from "@bloom-housing/ui-seeds/src/text/Tag"
import { ImageCard, t } from "@bloom-housing/ui-components"
import {
  IMAGE_FALLBACK_URL,
  imageUrlFromListing,
  oneLineAddress,
} from "@bloom-housing/shared-helpers"
import { DueDate } from "./DueDate"
import { Availability } from "./Availability"
import listingStyles from "../ListingViewSeeds.module.scss"
import styles from "./MainDetails.module.scss"

type MainDetailsProps = {
  dueDateContent: string[]
  listing: Listing
}

type ListingTag = {
  title: string
  variant: TagVariant
}

export const getListingTags = (listing: Listing): ListingTag[] => {
  const listingTags: ListingTag[] = []
  if (listing.reservedCommunityTypes) {
    listingTags.push({
      title: t(`listings.reservedCommunityTypes.${listing.reservedCommunityTypes.name}`),
      variant: "highlight-warm",
    })
  }
  if (listing.reviewOrderType === ReviewOrderTypeEnum.waitlist) {
    listingTags.push({
      title: t("listings.waitlist.open"),
      variant: "primary",
    })
  }
  if (listing.reviewOrderType === ReviewOrderTypeEnum.firstComeFirstServe) {
    listingTags.push({
      title: t("listings.applicationFCFS"),
      variant: "success",
    })
  }
  if (listing.reviewOrderType === ReviewOrderTypeEnum.lottery) {
    listingTags.push({
      title: "Lottery",
      variant: "highlight-cool",
    })
  }
  return listingTags
}

export const MainDetails = ({ dueDateContent, listing }: MainDetailsProps) => {
  if (!listing) return
  const googleMapsHref =
    "https://www.google.com/maps/place/" + oneLineAddress(listing.listingsBuildingAddress)
  const listingTags = getListingTags(listing)
  return (
    <div>
      <ImageCard
        images={imageUrlFromListing(listing, parseInt(process.env.listingPhotoSize)).map(
          (imageUrl: string) => {
            return {
              url: imageUrl,
            }
          }
        )}
        description={t("listings.buildingImageAltText")}
        moreImagesLabel={t("listings.moreImagesLabel")}
        moreImagesDescription={t("listings.moreImagesAltDescription", {
          listingName: listing.name,
        })}
        modalCloseLabel={t("t.backToListing")}
        modalCloseInContent
        fallbackImageUrl={IMAGE_FALLBACK_URL}
      />
      <div className={`${styles["listing-main-details"]} seeds-m-bs-header`}>
        <Heading
          priority={1}
          size={"xl"}
          className={`${styles["listing-heading"]} seeds-m-be-text`}
        >
          {listing.name}
        </Heading>
        <div className={styles["listing-address-container"]}>
          <div className={styles["listing-address"]}>
            <div className={`seeds-m-ie-4 ${styles["flex-margin"]}`}>
              {oneLineAddress(listing.listingsBuildingAddress)}
            </div>
            <div className={styles["flex-margin"]}>
              <Link href={googleMapsHref} newWindowTarget={true}>
                {t("t.viewOnMap")}
              </Link>
            </div>
          </div>
        </div>

        {listingTags.length > 0 && (
          <div className={`${styles["listing-tags"]} seeds-m-bs-3`} data-testid={"listing-tags"}>
            {listingTags.map((tag, index) => {
              return (
                <Tag variant={tag.variant} key={index}>
                  {tag.title}
                </Tag>
              )
            })}
          </div>
        )}

        <p className={"seeds-m-bs-3"}>{listing.developer}</p>
        <div className={`${listingStyles["hide-desktop"]} seeds-m-b-3`}>
          <DueDate content={dueDateContent} />
        </div>
      </div>
      <div className={listingStyles["hide-desktop"]}>
        <Availability
          reservedCommunityDescription={listing.reservedCommunityDescription}
          reservedCommunityType={listing.reservedCommunityTypes}
          reviewOrder={listing.reviewOrderType}
          status={listing.status}
          unitsAvailable={listing.unitsAvailable}
          waitlistOpenSpots={listing.waitlistOpenSpots}
        />
      </div>
    </div>
  )
}

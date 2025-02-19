import React from "react"
import InfoIcon from "@heroicons/react/24/solid/InformationCircleIcon"
import { Listing } from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import styles from "./ListingCard.module.scss"
import { imageUrlFromListing, oneLineAddress } from "@bloom-housing/shared-helpers"
import { StandardTable, t } from "@bloom-housing/ui-components"
import { Button, Heading, Icon, Message, Tag } from "@bloom-housing/ui-seeds"
import { getListingTags } from "../listing/listing_sections/MainDetails"
import { getListingApplicationStatus, getListingTableData } from "../../lib/helpers"

export interface ListingCardProps {
  listing: Listing
}

export const ListingCard = ({ listing }: ListingCardProps) => {
  const imageUrl = imageUrlFromListing(listing, parseInt(process.env.listingPhotoSize))[0]
  const listingTags = getListingTags(listing)
  const status = getListingApplicationStatus(listing)
  const statusContent = []
  if (status.content) statusContent.push(status.content)
  if (status.subContent) statusContent.push(status.subContent)
  // TODO: If favorites, add favorite button
  const actions = [
    <Button
      href={`/listing/${listing.id}/${listing.urlSlug}`}
      size={"sm"}
      variant={"primary-outlined"}
      className={styles["action-button"]}
    >
      {t("t.seeDetails")}
    </Button>,
  ]

  return (
    <div className={styles["listing-card"]}>
      <div className={styles["image"]}>
        {/* <img
          src={imageUrl}
          alt={t("listings.buildingImageAltText")}
          //   ref={(el) => (imgRefs.current[0] = el)}
          //   onError={onError}
        /> */}
        <div
          className={styles["image-background"]}
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      </div>
      <div className={styles["details"]}>
        <Heading priority={1} size={"xl"} className={styles["name"]}>
          {listing.name}
        </Heading>
        <div className={styles["address"]}>{oneLineAddress(listing.listingsBuildingAddress)}</div>
        {listingTags.length > 0 && (
          <div className={`${styles["tags"]}`}>
            {listingTags.map((tag, index) => {
              return (
                <Tag variant={tag.variant} key={index} className={styles["tag"]}>
                  {tag.title}
                </Tag>
              )
            })}
          </div>
        )}
        <div className={styles["unit-table"]}>
          <StandardTable
            headers={{
              unitType: "t.unitType",
              minimumIncome: "t.minimumIncome",
              rent: "t.rent",
            }}
            data={getListingTableData(listing.unitsSummarized, listing.reviewOrderType)}
            responsiveCollapse={true}
            cellClassName={"px-5 py-3"}
          />
        </div>

        <Message
          className={styles["due-date"]}
          customIcon={
            statusContent.length ? (
              <Icon size="md" className={styles["primary-color-icon"]} aria-hidden={true}>
                <InfoIcon />
              </Icon>
            ) : (
              <></>
            )
          }
        >
          <div className={styles["due-date-content"]}>
            <div>
              {statusContent.map((content, index) => {
                return <div key={index}>{content}</div>
              })}
            </div>
            <div className={styles["action-show-lg"]}>{actions.map((action) => action)}</div>
          </div>
        </Message>
        <div className={styles["action-hide-lg"]}>{actions.map((action) => action)}</div>
      </div>
    </div>
  )
}

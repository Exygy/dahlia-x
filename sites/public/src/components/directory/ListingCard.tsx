import React from "react"
import InfoIcon from "@heroicons/react/24/solid/InformationCircleIcon"
import { Listing } from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import styles from "./ListingCard.module.scss"
import { imageUrlFromListing, oneLineAddress } from "@bloom-housing/shared-helpers"
import { StandardTable, t } from "@bloom-housing/ui-components"
import { Card, Heading, Icon, Link, Message, Tag } from "@bloom-housing/ui-seeds"
import { getListingTags } from "../listing/listing_sections/MainDetails"
import { getListingApplicationStatusSeeds, getListingTableData } from "../../lib/helpers"

export interface ListingCardProps {
  listing: Listing
}

export const ListingCard = ({ listing }: ListingCardProps) => {
  const imageUrl = imageUrlFromListing(listing, parseInt(process.env.listingPhotoSize))[0]
  const listingTags = getListingTags(listing)
  const status = getListingApplicationStatusSeeds(listing)
  const statusContent = []
  if (status?.content) statusContent.push(status.content)
  if (status?.subContent) statusContent.push(status.subContent)
  // TODO: Add favorites if toggled on
  const actions = [
    // <Button
    //   onClick={() => alert("hi")}
    //   size={"sm"}
    //   variant={"primary-outlined"}
    //   className={`${styles["action-button"]}}`}
    //   ariaLabel={`Favorite ${listing.name}`}
    //   key={"Favorite"}
    // >
    //   Favorite
    // </Button>,
  ]

  return (
    <li className={styles["list-item"]}>
      <Card className={styles["listing-card-container"]}>
        <Card.Section>
          <div className={styles["listing-card"]}>
            <div className={styles["details"]}>
              <Link
                className={styles["main-link"]}
                href={`/listing/${listing.id}/${listing.urlSlug}`}
              >
                <Heading priority={2} size={"xl"} className={styles["name"]}>
                  {listing.name}
                </Heading>
              </Link>

              <div className={styles["address"]}>
                {oneLineAddress(listing.listingsBuildingAddress)}
              </div>
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

              {statusContent.length > 0 && (
                <Message
                  className={styles["due-date"]}
                  customIcon={
                    <Icon size="md" className={styles["primary-color-icon"]}>
                      <InfoIcon />
                    </Icon>
                  }
                >
                  <div className={styles["due-date-content"]}>
                    <div>
                      {statusContent.map((content, index) => {
                        return <div key={index}>{content}</div>
                      })}
                    </div>
                  </div>
                </Message>
              )}

              {actions.length > 0 && (
                <div className={styles["action-container"]}>{actions.map((action) => action)}</div>
              )}
            </div>
            <div className={styles["image"]}>
              <div
                className={styles["image-background"]}
                style={{ backgroundImage: `url(${imageUrl})` }}
                role="img"
                aria-label={t("listings.buildingImageAltText")}
              />
            </div>
          </div>
        </Card.Section>
      </Card>
    </li>
  )
}

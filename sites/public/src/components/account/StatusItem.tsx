import React from "react"
import { t } from "@bloom-housing/ui-components"
import { Button, Card, Tag } from "@bloom-housing/ui-seeds"
import styles from "./StatusItem.module.scss"
import accountStyles from "../../pages/account/account.module.scss"

interface StatusItemProps {
  applicationDueDate?: string
  applicationURL: string
  applicationUpdatedAt: string
  confirmationNumber?: string
  listingName: string
  listingURL: string
  strings?: {
    applicationDeadline?: string
    edited?: string
    seeListing?: string
    status?: string
    submittedStatus?: string
    viewApplication?: string
    yourNumber?: string
  }
}

const StatusItem = (props: StatusItemProps) => {
  return (
    <Card.Section
      className={`${accountStyles["account-card-section"]} ${accountStyles["application-card-section"]}`}
    >
      <article className={styles["status-item"]}>
        <header className={styles["status-item__header"]}>
          <h3 className={styles["status-item__title"]}>{props.listingName}</h3>
          <p className={styles["status-item__status"]}>
            <span className={styles["status-item-label"]}>
              {props.strings?.status ?? t("application.status")}:{" "}
              <Tag variant="primary">
                {props.strings?.submittedStatus ?? t("application.statuses.submitted")}
              </Tag>
            </span>
          </p>
        </header>

        <section className={styles["status-item__content"]}>
          <div className={styles["status-item__details"]}>
            {props.confirmationNumber && (
              <>
                <span className={styles["status-item__confirm-text"]}>
                  {props.strings?.yourNumber ?? t("application.yourLotteryNumber")}:
                </span>
                <br />
                <span className={styles["status-item__confirm-number"]}>
                  {props.confirmationNumber}
                </span>
              </>
            )}
          </div>

          <div className={styles["status-item__action"]}>
            {props.applicationDueDate && (
              <p className={styles["status-item__due"]}>
                {props.strings?.applicationDeadline ?? t("listings.applicationClose")}:{" "}
                {props.applicationDueDate}
              </p>
            )}
          </div>
        </section>

        <footer className={styles["status-item__footer"]}>
          <Button href={props.applicationURL} variant="primary-outlined" size="sm">
            {props.strings?.viewApplication ?? t("application.viewYourApplication")}
          </Button>
          <Button href={props.listingURL} variant="primary-outlined" size="sm">
            {props.strings?.seeListing ?? t("t.viewListing")}
          </Button>
        </footer>
      </article>
    </Card.Section>
  )
}

export { StatusItem as default, StatusItem }

import * as React from "react"
import { ListingEvent } from "@bloom-housing/backend-core/types"
import { EventDateSection } from "../../../../sections/EventDateSection"
import { t } from "../../../../helpers/translator"

const OpenHouseEvent = (props: { events: ListingEvent[] }) => {
  return (
    <section className="aside-block bg-primary-lighter border-t">
      <h4 className="text-caps-tiny">{t("listings.openHouseEvent.header")}</h4>
      {props.events.map((openHouseEvent, index) => (
        <div key={`openHouses-${index}`}>
          <EventDateSection event={openHouseEvent} />
          {openHouseEvent.url && (
            <p className="text text-gray-800 pb-3">
              <a href={openHouseEvent.url}>{t("listings.openHouseEvent.seeVideo")}</a>
            </p>
          )}
          {openHouseEvent.note && <p className="text text-gray-600">{openHouseEvent.note}</p>}
        </div>
      ))}
    </section>
  )
}

export { OpenHouseEvent as default, OpenHouseEvent }

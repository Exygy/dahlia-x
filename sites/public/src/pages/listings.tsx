import React from "react"
import { fetchClosedListings, fetchOpenListings } from "../lib/hooks"
import { Listing } from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import { ListingDirectory } from "../components/directory/ListingDirectory"
import { ListingDirectoryDeprecated } from "../components/directory/ListingDirectoryDeprecated"

export interface ListingsProps {
  openListings: Listing[]
  closedListings: Listing[]
}

export default function ListingsPage(props: ListingsProps) {
  return (
    <>
      {process.env.showNewSeedsDesigns ? (
        <ListingDirectory openListings={props.openListings} closedListings={props.closedListings} />
      ) : (
        <ListingDirectoryDeprecated
          openListings={props.openListings}
          closedListings={props.closedListings}
        />
      )}
    </>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getServerSideProps(context: { req: any }) {
  const openListings = fetchOpenListings(context.req)
  const closedListings = fetchClosedListings(context.req)

  return {
    props: { openListings: await openListings, closedListings: await closedListings },
  }
}

import React from "react"
import { render } from "@testing-library/react"
import { listing } from "@bloom-housing/shared-helpers/__tests__/testHelpers"
import { ListingDirectory } from "../../src/components/directory/ListingDirectory"
import { setupServer } from "msw/lib/node"
import { mockNextRouter } from "../testUtils"

const server = setupServer()

beforeAll(() => {
  server.listen()
  mockNextRouter()
})

afterEach(() => server.resetHandlers())

afterAll(() => server.close())

describe("<ListingDirectory>", () => {
  it("shows empty state", () => {
    const view = render(<ListingDirectory openListings={[]} closedListings={[]} />)
    expect(view.getByText("No listings currently have open applications.")).toBeDefined()
  })
  it("shows multiple open listings", () => {
    const view = render(
      <ListingDirectory
        openListings={[
          { ...listing, name: "ListingA" },
          { ...listing, name: "ListingB" },
        ]}
        closedListings={[]}
      />
    )
    expect(view.queryByText("No listings currently have open applications.")).toBeNull()
    expect(view.getByText("ListingA")).toBeDefined()
    expect(view.getByText("ListingB")).toBeDefined()
  })
})

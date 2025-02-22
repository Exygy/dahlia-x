import React from "react"
import { render } from "@testing-library/react"
import { listing } from "@bloom-housing/shared-helpers/__tests__/testHelpers"
import { ListingCard } from "../../src/components/directory/ListingCard"
import { oneLineAddress } from "@bloom-housing/shared-helpers"
import * as helpers from "../../src/lib/helpers"
import { getListingTags } from "../../src/components/listing/listing_sections/MainDetails"

describe("<ListingCard>", () => {
  it("shows all card content", () => {
    const view = render(<ListingCard listing={listing} />)
    const tags = getListingTags(listing)
    expect(view.getByText(listing.name)).toBeDefined()
    expect(view.getByText(oneLineAddress(listing.listingsBuildingAddress))).toBeDefined()
    tags.forEach((tag) => {
      expect(view.getByText(tag.title)).toBeDefined()
    })
    expect(view.getByText("Unit Type")).toBeDefined()
    expect(view.getByText("Minimum Income")).toBeDefined()
    expect(view.getByText("Rent")).toBeDefined()
    expect(view.getByText("First Come First Serve")).toBeDefined()
    expect(view.getAllByText("See Details").length).toBeGreaterThan(0)
    expect(view.getByLabelText("A picture of the building")).toBeDefined()
  })
  it("still shows see details button without listing statuses", () => {
    jest.spyOn(helpers, "getListingApplicationStatus").mockReturnValue(null)
    const view = render(<ListingCard listing={listing} />)
    expect(view.getByText(listing.name)).toBeDefined()
    expect(view.queryByText("First Come First Serve")).toBeNull()
    expect(view.getAllByText("See Details").length).toBeGreaterThan(0)
  })
})

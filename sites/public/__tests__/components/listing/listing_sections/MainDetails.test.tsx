import React from "react"
import { render, cleanup } from "@testing-library/react"
import { listing } from "@bloom-housing/shared-helpers/__tests__/testHelpers"
import { MainDetails } from "../../../../src/components/listing/listing_sections/MainDetails"
import { oneLineAddress } from "@bloom-housing/shared-helpers"
import { ReviewOrderTypeEnum } from "@bloom-housing/shared-helpers/src/types/backend-swagger"

afterEach(cleanup)

describe("<MainDetails>", () => {
  it("shows nothing if no listing", () => {
    const { queryByText } = render(<MainDetails listing={null} dueDateContent={[]} />)
    expect(queryByText(listing.name)).toBeNull()
  })
  it("shows all content", () => {
    const { getByText, getByRole, getByAltText } = render(
      <MainDetails listing={listing} dueDateContent={[]} />
    )
    expect(getByRole("heading", { level: 1 })).toHaveTextContent(listing.name)
    expect(getByText(oneLineAddress(listing.listingsBuildingAddress))).toBeDefined()
    expect(getByText("View on Map")).toBeDefined()
    expect(getByText(listing.developer)).toBeDefined()
    expect(getByAltText("A picture of the building")).toBeDefined()
  })
  it("shows reserved tag", () => {
    const { getByTestId, getAllByText } = render(
      <MainDetails
        listing={{
          ...listing,
          reviewOrderType: ReviewOrderTypeEnum.lottery,
          reservedCommunityTypes: { id: "id", name: "veteran" },
        }}
        dueDateContent={[]}
      />
    )
    expect(getByTestId("listing-tags")).toBeDefined()
    expect(getAllByText("Veteran").length).toBeGreaterThan(0)
  })
  it("shows units available tag for lottery", () => {
    const { getByTestId, getByText } = render(
      <MainDetails
        listing={{
          ...listing,
          reviewOrderType: ReviewOrderTypeEnum.lottery,
        }}
        dueDateContent={[]}
      />
    )
    expect(getByTestId("listing-tags")).toBeDefined()
    expect(getByText("Available Units")).toBeDefined()
  })
  it("shows units available tag for fcfs", () => {
    const { getByTestId, getByText } = render(
      <MainDetails
        listing={{
          ...listing,
          reviewOrderType: ReviewOrderTypeEnum.firstComeFirstServe,
        }}
        dueDateContent={[]}
      />
    )
    expect(getByTestId("listing-tags")).toBeDefined()
    expect(getByText("Available Units")).toBeDefined()
  })
  it("shows open waitlist tag", () => {
    const { getByTestId, getByText } = render(
      <MainDetails
        listing={{
          ...listing,
          reviewOrderType: ReviewOrderTypeEnum.waitlist,
        }}
        dueDateContent={[]}
      />
    )
    expect(getByTestId("listing-tags")).toBeDefined()
    expect(getByText("Open Waitlist")).toBeDefined()
  })
})

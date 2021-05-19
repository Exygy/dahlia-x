import React from "react"
import { cleanup } from "@testing-library/react"
import { occupancyTable, getOccupancyDescription } from "../../src/helpers/occupancyFormatting"
import Archer from "../../__tests__/fixtures/archer.json"
import { t } from "../../src/helpers/translator"

let ArcherListing = Object.assign({}, Archer) as any
ArcherListing.property = {}
ArcherListing.property.unitsSummarized = {}
ArcherListing.property.unitsSummarized = {
  unitTypes: ["threeBdrm", "twoBdrm", "SRO"],
  byUnitType: [
    {
      unitType: "threeBdrm",
      minIncomeRange: {
        min: "10",
        max: "20",
      },
      occupancyRange: {
        min: 2,
        max: 6,
      },
      rentAsPercentIncomeRange: {
        min: 15,
        max: 60,
      },
      rentRange: {
        min: "250",
        max: "350",
      },
      totalAvailable: 8,
      areaRange: {
        min: 5,
        max: 60,
      },
    },
    {
      unitType: "twoBdrm",
      minIncomeRange: {
        min: "10",
        max: "20",
      },
      occupancyRange: {
        min: 1,
        max: null,
      },
      rentAsPercentIncomeRange: {
        min: 15,
        max: 60,
      },
      rentRange: {
        min: "250",
        max: "350",
      },
      totalAvailable: 8,
      areaRange: {
        min: 5,
        max: 60,
      },
    },
    {
      unitType: "SRO",
      minIncomeRange: {
        min: "10",
        max: "20",
      },
      occupancyRange: {
        min: 2,
        max: 1,
      },
      rentAsPercentIncomeRange: {
        min: 15,
        max: 60,
      },
      rentRange: {
        min: "250",
        max: "350",
      },
      totalAvailable: 8,
      areaRange: {
        min: 5,
        max: 60,
      },
    },
  ],
}

let MultipleUnitRowsListing = Object.assign({}, Archer) as any
MultipleUnitRowsListing.property = {}
MultipleUnitRowsListing.property.unitsSummarized = {}
MultipleUnitRowsListing.property.unitsSummarized = {
  unitTypes: ["threeBdrm", "twoBdrm", "SRO"],
  byUnitType: [
    {
      unitType: "oneBdrm",
      minIncomeRange: {
        min: "10",
        max: "20",
      },
      occupancyRange: {
        min: 2,
        max: 6,
      },
      rentAsPercentIncomeRange: {
        min: null,
        max: null,
      },
      rentRange: {
        min: "100",
        max: "200",
      },
      totalAvailable: 8,
      areaRange: {
        min: 5,
        max: 60,
      },
    },
    {
      unitType: "oneBdrm",
      minIncomeRange: {
        min: "10",
        max: "20",
      },
      occupancyRange: {
        min: 2,
        max: 6,
      },
      rentAsPercentIncomeRange: {
        min: "30",
        max: "30",
      },
      rentRange: {
        min: null,
        max: null,
      },
      totalAvailable: 8,
      areaRange: {
        min: 5,
        max: 60,
      },
    },
    {
      unitType: "oneBdrm",
      minIncomeRange: {
        min: "10",
        max: "20",
      },
      occupancyRange: {
        min: 1,
        max: 7,
      },
      rentAsPercentIncomeRange: {
        min: "30",
        max: "30",
      },
      rentRange: {
        min: null,
        max: null,
      },
      totalAvailable: 8,
      areaRange: {
        min: 5,
        max: 60,
      },
    },
  ],
}

afterEach(cleanup)

describe("occupancy formatting helper", () => {
  it("properly creates occupany table", () => {
    expect(occupancyTable(ArcherListing)).toStrictEqual([
      {
        occupancy: "2-6 people",
        unitType: <strong>3 BR</strong>,
      },
      {
        occupancy: "at least 1 person",
        unitType: <strong>2 BR</strong>,
      },
      {
        occupancy: "1 person",
        unitType: <strong>Single Room Occupancy</strong>,
      },
    ])
  })
  it("properly creates occupany table with multitple unit rows", () => {
    expect(occupancyTable(MultipleUnitRowsListing)).toStrictEqual([
      {
        occupancy: "1-7 people",
        unitType: <strong>1 BR</strong>,
      },
    ])
  })
  it("properly creates occupany description for some SRO", () => {
    expect(getOccupancyDescription(ArcherListing)).toBe(t("listings.occupancyDescriptionSomeSro"))
  })
  it("properly creates occupany description for no SRO", () => {
    const NewListing = ArcherListing
    NewListing.property.unitsSummarized.unitTypes = ["threeBdrm", "twoBdrm"]
    expect(getOccupancyDescription(NewListing)).toBe(t("listings.occupancyDescriptionNoSro"))
  })
  it("properly creates occupany description for all SRO", () => {
    const NewListing = ArcherListing
    NewListing.property.unitsSummarized.unitTypes = ["SRO"]
    expect(getOccupancyDescription(NewListing)).toBe(t("listings.occupancyDescriptionAllSro"))
  })
})

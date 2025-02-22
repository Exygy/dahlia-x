import * as React from "react"
import {
  StandardTable,
  StandardTableData,
  t,
  ContentAccordion,
  getTranslationWithArguments,
  StackedTableRow,
} from "@bloom-housing/ui-components"
import { MinMax, ReviewOrderTypeEnum, Unit, UnitSummary } from "../types/backend-swagger"
import { numberOrdinal } from "../utilities/numberOrdinal"

const getTranslationFromCurrencyString = (value: string) => {
  if (value.startsWith("t.")) return getTranslationWithArguments(value)
  return value
}

export const unitsHeaders = {
  number: "t.unit",
  sqFeet: "t.area",
  numBathrooms: "listings.bath",
  floor: "t.floor",
}

export const unitSummariesTable = (
  summaries: UnitSummary[],
  listingReviewOrder: ReviewOrderTypeEnum
): StandardTableData => {
  const unitSummaries = summaries?.map((unitSummary) => {
    const unitPluralization =
      unitSummary.totalAvailable == 1 ? t("listings.vacantUnit") : t("listings.vacantUnits")
    const minIncome =
      unitSummary.minIncomeRange.min == unitSummary.minIncomeRange.max ? (
        <>
          <strong>{getTranslationFromCurrencyString(unitSummary.minIncomeRange.min)}</strong>
          {unitSummary.minIncomeRange.min !== "t.n/a" && ` ${t("t.perMonth")}`}
        </>
      ) : (
        <>
          <strong>{getTranslationFromCurrencyString(unitSummary.minIncomeRange.min)}</strong>
          {` ${t("t.to")} `}
          <strong>{getTranslationFromCurrencyString(unitSummary.minIncomeRange.max)}</strong>
          {` ${t("t.perMonth")}`}
        </>
      )

    const getRent = (rentMin: string, rentMax: string, percent = false) => {
      const unit = percent ? `% ${t("t.income")}` : ` ${t("t.perMonth")}`
      return rentMin == rentMax ? (
        <>
          <strong>{getTranslationFromCurrencyString(rentMin)}</strong>
          {rentMin !== "t.n/a" && unit}
        </>
      ) : (
        <>
          <strong>{getTranslationFromCurrencyString(rentMin)}</strong>
          {` ${t("t.to")} `}
          <strong>{getTranslationFromCurrencyString(rentMax)}</strong>
          {unit}
        </>
      )
    }

    // Use rent as percent income if available, otherwise use exact rent
    const rent = unitSummary.rentAsPercentIncomeRange.min
      ? getRent(
          unitSummary.rentAsPercentIncomeRange.min.toString(),
          unitSummary.rentAsPercentIncomeRange.max.toString(),
          true
        )
      : getRent(unitSummary.rentRange.min, unitSummary.rentRange.max)

    let availability = null
    if (listingReviewOrder !== ReviewOrderTypeEnum.waitlist) {
      availability = (
        <span>
          {unitSummary.totalAvailable > 0 ? (
            <>
              <strong>{unitSummary.totalAvailable}</strong> {unitPluralization}
            </>
          ) : (
            <span>
              <strong>{t("listings.waitlist.open")}</strong>
            </span>
          )}
        </span>
      )
    } else if (listingReviewOrder === ReviewOrderTypeEnum.waitlist) {
      availability = (
        <span>
          <strong>{t("listings.waitlist.open")}</strong>
        </span>
      )
    }

    return {
      unitType: {
        content: <strong>{t(`listings.unitTypes.${unitSummary.unitTypes?.name}`)}</strong>,
      },
      minimumIncome: {
        content: <span>{minIncome}</span>,
      },
      rent: { content: <span>{rent}</span> },
      availability: {
        content: availability,
      },
    }
  })

  return unitSummaries
}
export const stackedUnitSummariesTable = (
  summaries: UnitSummary[]
): Record<string, StackedTableRow>[] => {
  type StackedSummary = {
    minDollarRent: number | null
    maxDollarRent: number | null
    minPercentageRent: number | null
    maxPercentageRent: number | null
    minIncome: number | null
    maxIncome: number | null
    minUnitType: number | null
    maxUnitType: number | null
    minUnitName: string | null
    maxUnitName: string | null
  }

  // TODO: Move this to the backend if we want these new kinds of summaries
  const ranges: StackedSummary = summaries
    .sort((summaryA, summaryB) => summaryA.unitTypes.numBedrooms - summaryB.unitTypes.numBedrooms)
    .reduce(
      (acc, curr) => {
        const replaceIfExceeds = (
          less: boolean,
          current: number | null,
          updated: number | null
        ) => {
          const isValid = (test: number | null) => {
            return test !== null && !isNaN(test)
          }
          if (!isValid(current) && isValid(updated)) {
            return updated
          }
          if (!isValid(updated) && isValid(current)) {
            return current
          }
          if (isValid(current) && isValid(updated) && current !== null && updated !== null) {
            if (less) {
              return updated < current ? updated : current
            } else {
              return updated > current ? updated : current
            }
          }
          return null
        }
        const updatedMinUnitType = replaceIfExceeds(
          true,
          acc.minUnitType,
          curr.unitTypes.numBedrooms
        )
        const updatedMaxUnitType = replaceIfExceeds(
          false,
          acc.maxUnitType,
          curr.unitTypes.numBedrooms
        )

        return {
          minDollarRent: replaceIfExceeds(
            true,
            acc.minDollarRent,
            parseInt(curr.rentRange.min.replace(/[$,]+/g, ""))
          ),
          maxDollarRent: replaceIfExceeds(
            false,
            acc.maxDollarRent,
            parseInt(curr.rentRange.max.replace(/[$,]+/g, ""))
          ),
          minPercentageRent: replaceIfExceeds(
            true,
            acc.minPercentageRent,
            curr.rentAsPercentIncomeRange.min
          ),
          maxPercentageRent: replaceIfExceeds(
            false,
            acc.maxPercentageRent,
            curr.rentAsPercentIncomeRange.max
          ),
          minIncome: replaceIfExceeds(
            true,
            acc.minIncome,
            parseInt(curr.minIncomeRange.min.replace(/[$,]+/g, ""))
          ),
          maxIncome: replaceIfExceeds(
            false,
            acc.maxIncome,
            parseInt(curr.minIncomeRange.max.replace(/[$,]+/g, ""))
          ),
          minUnitType: replaceIfExceeds(true, acc.minUnitType, curr.unitTypes.numBedrooms),
          maxUnitType: replaceIfExceeds(false, acc.maxUnitType, curr.unitTypes.numBedrooms),
          minUnitName:
            updatedMinUnitType !== acc.minUnitType ? curr.unitTypes.name : acc.minUnitName,
          maxUnitName:
            updatedMaxUnitType !== acc.maxUnitType ? curr.unitTypes.name : acc.maxUnitName,
        }
      },
      {
        minDollarRent: null,
        maxDollarRent: null,
        minPercentageRent: null,
        maxPercentageRent: null,
        minIncome: null,
        maxIncome: null,
        minUnitType: null,
        maxUnitType: null,
        minUnitName: null,
        maxUnitName: null,
      }
    )
  const getUnitText = (ranges: StackedSummary) => {
    if (ranges.minUnitType === ranges.maxUnitType)
      return t(`listings.unitTypes.${ranges.minUnitName}`)
    return `${t(`listings.unitTypes.${ranges.minUnitName}`)} - ${t(
      `listings.unitTypes.${ranges.maxUnitName}`
    )}`
  }
  const getIncomeText = (ranges: StackedSummary) => {
    if (ranges.minIncome === null || ranges.maxIncome === null) return t("t.n/a")
    if (ranges.minIncome === ranges.maxIncome) return `$${ranges.minIncome.toLocaleString()}`
    return `$${ranges.minIncome.toLocaleString()} ${t(
      "t.to"
    )} $${ranges.maxIncome.toLocaleString()}`
  }
  const getRentText = (ranges: StackedSummary) => {
    let rentText = ""
    if (ranges.minDollarRent !== null && ranges.maxDollarRent !== null) {
      if (ranges.minDollarRent === ranges.maxDollarRent)
        rentText = `$${ranges.minDollarRent.toLocaleString()}`
      else
        rentText = `$${ranges.minDollarRent.toLocaleString()} ${t(
          "t.to"
        )} $${ranges.maxDollarRent.toLocaleString()}`
    }
    if (ranges.minPercentageRent !== null && ranges.maxPercentageRent !== null) {
      if (ranges.minPercentageRent === ranges.maxPercentageRent) {
        if (rentText) rentText = rentText + " / "
        rentText = rentText + `${ranges.minPercentageRent}% ${t("t.income")}`
      } else {
        if (rentText) rentText = rentText + " / "
        rentText =
          rentText +
          `${ranges.minPercentageRent}% ${t("t.to")} ${ranges.maxPercentageRent}% ${t("t.income")}`
      }
    }
    if (!rentText) rentText = t("t.n/a")
    return rentText
  }

  const rowData = {
    unitType: {
      cellText: getUnitText(ranges),
      cellSubText: "",
    },
    minimumIncome: {
      cellText: getIncomeText(ranges),
      cellSubText: getIncomeText(ranges) !== t("t.n/a") ? t("t.perMonth") : "",
    },
    rent: {
      cellText: getRentText(ranges),
      cellSubText: getRentText(ranges) !== t("t.n/a") ? t("t.perMonth") : "",
    },
  }

  return [rowData]
}

export const getSummariesTable = (
  summaries: UnitSummary[],
  listingReviewOrder: ReviewOrderTypeEnum
): StandardTableData => {
  let unitSummaries: StandardTableData = []

  if (summaries?.length > 0) {
    unitSummaries = unitSummariesTable(summaries, listingReviewOrder)
  }
  return unitSummaries
}

export const getStackedSummariesTable = (
  summaries: UnitSummary[]
): Record<string, StackedTableRow>[] => {
  let unitSummaries: Record<string, StackedTableRow>[] = []

  if (summaries?.length > 0) {
    unitSummaries = stackedUnitSummariesTable(summaries)
  }
  return unitSummaries
}

const formatRange = (range: MinMax, ordinalize?: boolean) => {
  let min: string | number = range.min
  let max: string | number = range.max

  if (ordinalize) {
    min = numberOrdinal(min)
    max = numberOrdinal(max)
  }

  if (min == max) {
    return min
  } else {
    return `${min} - ${max}`
  }
}

const unitsLabel = (units: Unit[]): string => {
  const label = units.length > 1 ? t("t.units") : t("t.unit")
  return `${units.length} ${label}`
}

interface UnitTablesProps {
  units: Unit[]
  unitSummaries: UnitSummary[]
  disableAccordion?: boolean
}

export const getUnitTableData = (units: Unit[], unitSummary: UnitSummary) => {
  const availableUnits = units.filter(
    (unit: Unit) => unit.unitTypes?.name == unitSummary.unitTypes.name
  )

  let floorSection: React.ReactNode
  const unitsFormatted = availableUnits.map((unit: Unit) => {
    return {
      number: { content: unit.number },
      sqFeet: {
        content: (
          <>
            {unit.sqFeet ? (
              <>
                <strong>{parseInt(unit.sqFeet)}</strong> {t("t.sqFeet")}
              </>
            ) : (
              <></>
            )}
          </>
        ),
      },
      numBathrooms: {
        content: (
          <strong>
            {unit.numBathrooms === 0 ? t("listings.unit.sharedBathroom") : unit.numBathrooms}
          </strong>
        ),
      },
      floor: { content: <strong>{unit.floor}</strong> },
    }
  })

  let areaRangeSection: React.ReactNode
  if (unitSummary.areaRange?.min || unitSummary.areaRange?.max) {
    areaRangeSection = `, ${formatRange(unitSummary.areaRange)} ${t("t.squareFeet")}`
  }

  if (unitSummary.floorRange && unitSummary.floorRange.min) {
    floorSection = `, ${formatRange(unitSummary.floorRange, true)} 
        ${unitSummary.floorRange.max > unitSummary.floorRange.min ? t("t.floors") : t("t.floor")}`
  }

  const barContent = (
    <div className={"toggle-header-content"}>
      <strong>{t("listings.unitTypes." + unitSummary.unitTypes.name)}</strong>:&nbsp;
      {unitsLabel(availableUnits)}
      {areaRangeSection}
      {floorSection}
    </div>
  )

  return {
    availableUnits,
    areaRangeSection,
    floorSection,
    unitsFormatted,
    barContent,
  }
}

export const UnitTables = (props: UnitTablesProps) => {
  const unitSummaries = props.unitSummaries || []

  return (
    <>
      {unitSummaries.map((unitSummary: UnitSummary, index) => {
        const results = getUnitTableData(props.units, unitSummary)

        const getExpandableContent = () => {
          return (
            <div className="unit-table">
              <StandardTable headers={unitsHeaders} data={results.unitsFormatted} />
            </div>
          )
        }

        return (
          <ContentAccordion
            customBarContent={results.barContent}
            customExpandedContent={getExpandableContent()}
            disableAccordion={props.disableAccordion}
            accordionTheme={"blue"}
            key={index}
          />
        )
      })}
    </>
  )
}

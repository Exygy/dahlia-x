import { ReviewOrderTypeEnum, UnitTypeEnum } from '@prisma/client';
import { UnitSummary } from '../dtos/units/unit-summary.dto';
import Unit from '../dtos/units/unit.dto';
import { AmiChart } from '../dtos/ami-charts/ami-chart.dto';
import { Listing } from '../dtos/listings/listing.dto';
import { MinMaxCurrency } from '../dtos/shared/min-max-currency.dto';
import { MinMax } from '../dtos/shared/min-max.dto';
import { UnitsSummarized } from '../dtos/units/unit-summarized.dto';
import { UnitType } from '../dtos/unit-types/unit-type.dto';
import { UnitAccessibilityPriorityType } from '../dtos/unit-accessibility-priority-types/unit-accessibility-priority-type.dto';
import { AmiChartItem } from '../dtos/units/ami-chart-item.dto';
import { UnitAmiChartOverride } from '../dtos/units/ami-chart-override.dto';
import { isEmpty } from 'class-validator';
import UnitGroupAmiLevel from 'src/dtos/unit-groups/unit-group-ami-level.dto';

type AnyDict = { [key: string]: unknown };
type UnitMap = {
  [key: string]: Unit[];
};

export const UnitTypeSort = [
  UnitTypeEnum.SRO,
  UnitTypeEnum.studio,
  UnitTypeEnum.oneBdrm,
  UnitTypeEnum.twoBdrm,
  UnitTypeEnum.threeBdrm,
  UnitTypeEnum.fourBdrm,
  UnitTypeEnum.fiveBdrm,
];

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export const minMax = (baseValue: MinMax, newValue: number): MinMax => {
  return {
    min: Math.min(baseValue.min, newValue),
    max: Math.max(baseValue.max, newValue),
  };
};

export const minMaxCurrency = (
  baseValue: MinMaxCurrency,
  newValue: number,
): MinMaxCurrency => {
  return {
    min: usd.format(
      Math.min(parseFloat(baseValue.min.replace(/[^0-9.-]+/g, '')), newValue),
    ),
    max: usd.format(
      Math.max(parseFloat(baseValue.max.replace(/[^0-9.-]+/g, '')), newValue),
    ),
  };
};

export const yearlyCurrencyStringToMonthly = (currency: string) => {
  return usd.format(parseFloat(currency.replace(/[^0-9.-]+/g, '')) / 12);
};

export const getAmiChartItemUniqueKey = (amiChartItem: AmiChartItem) => {
  return (
    amiChartItem.householdSize.toString() +
    '-' +
    amiChartItem.percentOfAmi.toString()
  );
};

export const mergeAmiChartWithOverrides = (
  amiChart: AmiChart,
  override: UnitAmiChartOverride,
) => {
  const householdAmiPercentageOverrideMap: Map<string, AmiChartItem> =
    override.items?.reduce((acc, amiChartItem) => {
      acc.set(getAmiChartItemUniqueKey(amiChartItem), amiChartItem);
      return acc;
    }, new Map());

  for (const amiChartItem of amiChart.items) {
    const amiChartItemOverride = householdAmiPercentageOverrideMap.get(
      getAmiChartItemUniqueKey(amiChartItem),
    );
    if (amiChartItemOverride) {
      amiChartItem.income = amiChartItemOverride.income;
    }
  }
  return amiChart;
};

// Creates data used to display a table of household size/unit size by maximum income per the AMI charts on the units
// Unit sets can have multiple AMI charts used, in which case the table displays ranges
export const generateHmiData = (
  units: Unit[],
  minMaxHouseholdSize: MinMax[],
  amiCharts: AmiChart[],
) => {
  if (!units || units.length === 0) {
    return null;
  }
  // Currently, BMR chart is just toggling whether or not the first column shows Household Size or Unit Type
  const showUnitType = units[0].bmrProgramChart;

  type ChartAndPercentage = {
    percentage: number;
    chart: AmiChart;
  };

  const maxAMIChartHouseholdSize = amiCharts.reduce((maxSize, amiChart) => {
    const amiChartMax = amiChart.items.reduce((max, item) => {
      return Math.max(max, item.householdSize);
    }, 0);
    return Math.max(maxSize, amiChartMax);
  }, 0);

  // All unique AMI percentages across all units
  const allPercentages: number[] = [
    ...new Set(
      units
        .filter((item) => item != null)
        .map((unit) => parseInt(unit.amiPercentage, 10)),
    ),
  ].sort(function (a, b) {
    return a - b;
  });

  const amiChartMap: Record<string, AmiChart> = amiCharts.reduce(
    (acc, amiChart) => {
      acc[amiChart.id] = amiChart;
      return acc;
    },
    {},
  );

  // All unique combinations of an AMI percentage and an AMI chart across all units
  const uniquePercentageChartSet: ChartAndPercentage[] = amiCharts.length
    ? [
        ...new Set(
          units
            .filter((unit) => unit.amiChart && amiChartMap[unit.amiChart.id])
            .map((unit) => {
              let amiChart = amiChartMap[unit.amiChart.id];
              if (unit.unitAmiChartOverrides) {
                amiChart = mergeAmiChartWithOverrides(
                  amiChart,
                  unit.unitAmiChartOverrides,
                );
              }
              return JSON.stringify({
                percentage: parseInt(unit.amiPercentage, 10),
                chart: amiChart,
              });
            }),
        ),
      ].map((uniqueSetString) => JSON.parse(uniqueSetString))
    : [];

  const hmiHeaders = {
    sizeColumn: showUnitType ? 't.unitType' : 'listings.householdSize',
  } as AnyDict;

  let bmrHeaders = [
    'listings.unitTypes.SRO',
    'listings.unitTypes.studio',
    'listings.unitTypes.oneBdrm',
    'listings.unitTypes.twoBdrm',
    'listings.unitTypes.threeBdrm',
    'listings.unitTypes.fourBdrm',
  ];
  // this is to map currentHouseholdSize to a units max occupancy
  const unitOccupancy = [];

  let validHouseholdSizes = minMaxHouseholdSize.reduce((validSizes, minMax) => {
    // Get all numbers between min and max
    // If min is more than the largest chart value, make sure we show the largest value
    const unitHouseholdSizes = [
      ...Array(Math.min(minMax.max, maxAMIChartHouseholdSize) + 1).keys(),
    ].filter(
      (value) => value >= Math.min(minMax.min, maxAMIChartHouseholdSize),
    );
    return [...new Set([...validSizes, ...unitHouseholdSizes])].sort((a, b) =>
      a < b ? -1 : 1,
    );
  }, []);

  if (showUnitType) {
    // the unit types used by the listing
    const selectedUnitTypes = units.reduce((obj, unit) => {
      if (unit.unitTypes) {
        obj[unit.unitTypes.name] = {
          rooms: unit.unitTypes.numBedrooms,
          maxOccupancy: unit.maxOccupancy,
        };
      }
      return obj;
    }, {});
    const sortedUnitTypeNames = Object.keys(selectedUnitTypes).sort((a, b) =>
      selectedUnitTypes[a].rooms < selectedUnitTypes[b].rooms
        ? -1
        : selectedUnitTypes[a].rooms > selectedUnitTypes[b].rooms
        ? 1
        : 0,
    );
    // setbmrHeaders based on the actual units
    bmrHeaders = sortedUnitTypeNames.map(
      (type) => `listings.unitTypes.${type}`,
    );

    // set unitOccupancy based off of a units max occupancy
    sortedUnitTypeNames.forEach((name) => {
      unitOccupancy.push(selectedUnitTypes[name].maxOccupancy);
    });

    // if showUnitType, we want to set the bedroom sizes to the valid household sizes
    validHouseholdSizes = [
      ...new Set(units.map((unit) => unit.unitTypes?.numBedrooms || 0)),
    ];
  }

  // 1. If there are multiple AMI levels, show each AMI level (max income per
  //    year only) for each size (number of cols = the size col + # ami levels)
  // 2. If there is only one AMI level, show max income per month and per
  //    year for each size (number of cols = the size col + 2 for each income style)
  if (allPercentages.length > 1) {
    allPercentages.forEach((percent) => {
      // Pass translation with its respective argument with format `key*argumentName:argumentValue`
      hmiHeaders[
        `ami${percent}`
      ] = `listings.percentAMIUnit*percent:${percent}`;
    });
  } else {
    hmiHeaders['maxIncomeMonth'] = 'listings.maxIncomeMonth';
    hmiHeaders['maxIncomeYear'] = 'listings.maxIncomeYear';
  }

  const findAmiValueInChart = (
    amiChart: AmiChartItem[],
    householdSize: number,
    percentOfAmi: number,
  ) => {
    return amiChart.find((item) => {
      return (
        item.householdSize === householdSize &&
        item.percentOfAmi === percentOfAmi
      );
    })?.income;
  };

  // Build row data by household size
  const hmiRows = validHouseholdSizes.reduce(
    (hmiRowsData, householdSize: number) => {
      const currentHouseholdSize = showUnitType
        ? unitOccupancy[householdSize - 1]
        : householdSize;

      const rowData = {
        sizeColumn: showUnitType
          ? bmrHeaders[householdSize - 1]
          : currentHouseholdSize,
      };

      let rowHasData = false; // Row is valid if at least one column is filled, otherwise don't push the row
      allPercentages.forEach((currentAmiPercent) => {
        // Get all the charts that we're using with this percentage and size
        const uniquePercentCharts = uniquePercentageChartSet.filter(
          (uniqueChartAndPercentage) => {
            return uniqueChartAndPercentage.percentage === currentAmiPercent;
          },
        );
        // If we don't have data for this AMI percentage and household size, this cell is empty
        if (uniquePercentCharts.length === 0) {
          if (allPercentages.length === 1) {
            rowData['maxIncomeMonth'] = '';
            rowData['maxIncomeYear'] = '';
          } else {
            rowData[`ami${currentAmiPercent}`] = '';
          }
        } else {
          if (!uniquePercentCharts[0].chart) {
            return hmiRowsData;
          }
          // If we have chart data, create a max income range string
          const firstChartValue = findAmiValueInChart(
            uniquePercentCharts[0].chart.items,
            currentHouseholdSize,
            currentAmiPercent,
          );
          if (!firstChartValue) {
            return hmiRowsData;
          }
          const maxIncomeRange = uniquePercentCharts.reduce(
            (incomeRange, uniqueSet) => {
              return minMaxCurrency(
                incomeRange,
                findAmiValueInChart(
                  uniqueSet.chart.items,
                  currentHouseholdSize,
                  currentAmiPercent,
                ),
              );
            },
            {
              min: usd.format(firstChartValue),
              max: usd.format(firstChartValue),
            } as MinMaxCurrency,
          );
          if (allPercentages.length === 1) {
            rowData[
              'maxIncomeMonth'
            ] = `listings.monthlyIncome*income:${yearlyCurrencyStringToMonthly(
              maxIncomeRange.max,
            )}`;
            rowData[
              'maxIncomeYear'
            ] = `listings.annualIncome*income:${maxIncomeRange.max}`;
          } else {
            rowData[
              `ami${currentAmiPercent}`
            ] = `listings.annualIncome*income:${maxIncomeRange.max}`;
          }
          rowHasData = true;
        }
      });
      if (rowHasData) {
        hmiRowsData.push(rowData);
      }
      return hmiRowsData;
    },
    [],
  );

  return { columns: hmiHeaders, rows: hmiRows };
};

export const getCurrencyString = (initialValue: string) => {
  const roundedValue = getRoundedNumber(initialValue);
  if (Number.isNaN(roundedValue)) return 't.n/a';
  return usd.format(roundedValue);
};

export const getRoundedNumber = (initialValue: string) => {
  return parseFloat(parseFloat(initialValue).toFixed(2));
};

export const getDefaultSummaryRanges = (unit: Unit) => {
  return {
    areaRange: { min: parseFloat(unit.sqFeet), max: parseFloat(unit.sqFeet) },
    minIncomeRange: {
      min: getCurrencyString(unit.monthlyIncomeMin),
      max: getCurrencyString(unit.monthlyIncomeMin),
    },
    occupancyRange: { min: unit.minOccupancy, max: unit.maxOccupancy },
    rentRange: {
      min: getCurrencyString(unit.monthlyRent),
      max: getCurrencyString(unit.monthlyRent),
    },
    rentAsPercentIncomeRange: {
      min: parseFloat(unit.monthlyRentAsPercentOfIncome),
      max: parseFloat(unit.monthlyRentAsPercentOfIncome),
    },
    floorRange: {
      min: unit.floor,
      max: unit.floor,
    },
    unitTypes: unit.unitTypes,
    totalAvailable: 0,
  };
};

export const getUnitsSummary = (unit: Unit, existingSummary?: UnitSummary) => {
  if (!existingSummary) {
    return getDefaultSummaryRanges(unit);
  }
  const summary = existingSummary;

  // Income Range
  if (unit.monthlyIncomeMin) {
    summary.minIncomeRange = minMaxCurrency(
      summary.minIncomeRange,
      getRoundedNumber(unit.monthlyIncomeMin),
    );
  }

  // Occupancy Range
  if (unit.minOccupancy) {
    summary.occupancyRange = minMax(summary.occupancyRange, unit.minOccupancy);
  }
  if (unit.maxOccupancy) {
    summary.occupancyRange = minMax(summary.occupancyRange, unit.maxOccupancy);
  }

  // Rent Ranges
  if (unit.monthlyRentAsPercentOfIncome) {
    summary.rentAsPercentIncomeRange = minMax(
      summary.rentAsPercentIncomeRange,
      parseFloat(unit.monthlyRentAsPercentOfIncome),
    );
  }
  if (unit.monthlyRent)
    summary.rentRange = minMaxCurrency(
      summary.rentRange,
      getRoundedNumber(unit.monthlyRent),
    );

  // Floor Range
  if (unit.floor) {
    summary.floorRange = minMax(summary.floorRange, unit.floor);
  }

  // Area Range
  if (unit.sqFeet) {
    summary.areaRange = minMax(summary.areaRange, parseFloat(unit.sqFeet));
  }

  return summary;
};

// Allows for multiples rows under one unit type if the rent methods differ
export const summarizeUnitsByTypeAndRent = (
  units: Unit[],
  listing: Listing,
): UnitSummary[] => {
  const summaries: UnitSummary[] = [];
  const unitMap: UnitMap = {};

  units.forEach((unit) => {
    const currentUnitType = unit.unitTypes;
    const currentUnitRent = unit.monthlyRentAsPercentOfIncome;
    const thisKey = currentUnitType?.name.concat(currentUnitRent);
    if (!(thisKey in unitMap)) unitMap[thisKey] = [];
    unitMap[thisKey].push(unit);
  });

  for (const key in unitMap) {
    const finalSummary = unitMap[key].reduce((summary, unit, index) => {
      return getUnitsSummary(unit, index === 0 ? null : summary);
    }, {} as UnitSummary);
    if (listing.reviewOrderType !== ReviewOrderTypeEnum.waitlist) {
      finalSummary.totalAvailable = unitMap[key].length;
    }
    summaries.push(finalSummary);
  }

  return summaries.sort((a, b) => {
    return (
      UnitTypeSort.findIndex((sortedType) => a.unitTypes.name === sortedType) -
        UnitTypeSort.findIndex(
          (sortedType) => b.unitTypes.name === sortedType,
        ) || Number(a.minIncomeRange.min) - Number(b.minIncomeRange.min)
    );
  });
};

// One row per unit type
export const summarizeUnitsByType = (
  units: Unit[],
  unitTypes: UnitType[],
): UnitSummary[] => {
  const summaries = unitTypes.map((unitType: UnitType): UnitSummary => {
    const summary = {} as UnitSummary;
    const unitsByType = units.filter(
      (unit: Unit) => unit.unitTypes.name == unitType.name,
    );
    const finalSummary = Array.from(unitsByType).reduce(
      (summary, unit, index) => {
        return getUnitsSummary(unit, index === 0 ? null : summary);
      },
      summary,
    );
    return finalSummary;
  });
  return summaries.sort((a, b) => {
    return (
      UnitTypeSort.findIndex((sortedType) => a.unitTypes.name === sortedType) -
        UnitTypeSort.findIndex(
          (sortedType) => b.unitTypes.name === sortedType,
        ) || Number(a.minIncomeRange.min) - Number(b.minIncomeRange.min)
    );
  });
};

export const summarizeByAmi = (listing: Listing, amiPercentages: string[]) => {
  return amiPercentages.map((percent: string) => {
    const unitsByAmiPercentage = listing.units.filter(
      (unit: Unit) => unit.amiPercentage == percent,
    );
    return {
      percent: percent,
      byUnitType: summarizeUnitsByTypeAndRent(unitsByAmiPercentage, listing),
    };
  });
};

export const getUnitTypes = (units: Unit[]): UnitType[] => {
  const unitTypes = new Map<string, UnitType>();
  for (const unitType of units
    .map((unit) => unit.unitTypes)
    .filter((item) => item != null)) {
    unitTypes.set(unitType.id, unitType);
  }

  return Array.from(unitTypes.values());
};

export const summarizeUnits = (
  listing: Listing,
  amiCharts: AmiChart[],
): UnitsSummarized => {
  const data = {} as UnitsSummarized;
  const units = listing.units;
  if (!units || (units && units.length === 0)) {
    return data;
  }

  const unitTypes = new Map<string, UnitType>();
  for (const unitType of units
    .map((unit) => unit.unitTypes)
    .filter((item) => item != null)) {
    unitTypes.set(unitType.id, unitType);
  }
  data.unitTypes = getUnitTypes(units);

  const priorityTypes = new Map<string, UnitAccessibilityPriorityType>();
  for (const priorityType of units
    .map((unit) => unit.unitAccessibilityPriorityTypes)
    .filter((item) => item != null)) {
    priorityTypes.set(priorityType.id, priorityType);
  }
  data.priorityTypes = Array.from(priorityTypes.values());

  data.amiPercentages = Array.from(
    new Set(
      units.map((unit) => unit.amiPercentage).filter((item) => item != null),
    ),
  );
  data.byUnitTypeAndRent = summarizeUnitsByTypeAndRent(listing.units, listing);
  data.byUnitType = summarizeUnitsByType(units, data.unitTypes);
  data.byAMI = summarizeByAmi(listing, data.amiPercentages);
  data.hmi = generateHmiData(
    units,
    data.byUnitType.map((byUnitType) => byUnitType.occupancyRange),
    amiCharts,
  );
  return data;
};

export const convertToTitleCase = (value: string): string => {
  if (isEmpty(value)) return '';
  const spacedValue = value.replace(/([A-Z])/g, (match) => ` ${match}`);
  const result = spacedValue.charAt(0).toUpperCase() + spacedValue.slice(1);
  return result;
};

export const getRentTypes = (amiLevels: UnitGroupAmiLevel[]): string => {
  if (isEmpty(amiLevels)) return '';
  const uniqueTypes = [];
  amiLevels?.forEach((elem) => {
    if (!uniqueTypes.includes(elem.monthlyRentDeterminationType))
      uniqueTypes.push(elem.monthlyRentDeterminationType);
  });
  const formattedResults = uniqueTypes
    .map((elem) => convertToTitleCase(elem))
    .join(', ');
  return formattedResults;
};

export const formatRange = (
  min: string | number,
  max: string | number,
  prefix: string,
  postfix: string,
): string => {
  if (isEmpty(min) && isEmpty(max)) return '';
  if (min == max || isEmpty(max)) return `${prefix}${min}${postfix}`;
  if (isEmpty(min)) return `${prefix}${max}${postfix}`;
  return `${prefix}${min}${postfix} - ${prefix}${max}${postfix}`;
};

export function formatRentRange(rent: MinMax, percent: MinMax): string {
  let toReturn = '';
  if (rent) {
    toReturn += formatRange(rent.min, rent.max, '', '');
  }
  if (rent && percent) {
    toReturn += ', ';
  }
  if (percent) {
    toReturn += formatRange(percent.min, percent.max, '', '%');
  }
  return toReturn;
}

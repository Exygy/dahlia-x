import { AmiChart } from '../../../src/dtos/ami-charts/ami-chart.dto';
import { UnitAmiChartOverride } from '../../../src/dtos/units/ami-chart-override.dto';
import {
  generateHmiData,
  mergeAmiChartWithOverrides,
} from '../../../src/utilities/unit-utilities';
import { Unit } from '../../../src/dtos/units/unit.dto';
import { AmiChartItem } from '../../../src/dtos/units/ami-chart-item.dto';
import { MinMax } from '../../../src/dtos/shared/min-max.dto';
import {
  convertToTitleCase,
  getRentTypes,
  formatRange,
  formatRentRange,
} from '../../../src/utilities/unit-utilities';
import { UnitGroupAmiLevel } from '../../../src/dtos/unit-groups/unit-group-ami-level.dto';

const defaultValues = {
  createdAt: new Date(),
  updatedAt: new Date(),
};

const unit: Unit = {
  ...defaultValues,
  amiPercentage: '30',
  maxOccupancy: 2,
  amiChart: {
    id: 'ami1',
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [],
    name: 'ami1',
    jurisdictions: {
      id: 'id',
    },
  },
  id: 'example',
};

const generateAmiChartItems = (
  maxHousehold: number,
  percentage: number,
  baseAmount: number,
): AmiChartItem[] => {
  return [...Array(maxHousehold).keys()].map((value: number) => {
    return {
      percentOfAmi: percentage,
      householdSize: value + 1,
      income: baseAmount + 1000 * value,
    };
  });
};

const generateAmiChart = (): AmiChart => {
  return {
    ...defaultValues,
    id: 'ami1',
    name: 'ami1',
    jurisdictions: {
      id: 'id',
    },
    items: generateAmiChartItems(8, 30, 30_000),
  };
};

describe('Unit Transformations', () => {
  describe('mergeAmiChartWithOverrides', () => {
    it('Ami chart items are correctly overwritten', () => {
      const amiChartOverride: UnitAmiChartOverride = {
        id: 'id',
        createdAt: new Date(),
        updatedAt: new Date(),
        items: [
          {
            percentOfAmi: 30,
            householdSize: 2,
            income: 20,
          },
        ],
      };
      const result = mergeAmiChartWithOverrides(
        generateAmiChart(),
        amiChartOverride,
      );
      expect(result.items.length).toBe(8);
      expect(result.items[0].income).toBe(30000);
      expect(result.items[1].income).toBe(20);
      expect(result.items[2].income).toBe(32000);
    });
  });

  describe('generateHmiData', () => {
    it('should generate HMI data for one unit and amiChart', () => {
      const result = generateHmiData(
        [unit],
        [{ min: 2, max: 5 }],
        [generateAmiChart()],
      );

      expect(result).toEqual({
        columns: {
          maxIncomeMonth: 'listings.maxIncomeMonth',
          maxIncomeYear: 'listings.maxIncomeYear',
          sizeColumn: 'listings.householdSize',
        },
        rows: [
          {
            maxIncomeMonth: 'listings.monthlyIncome*income:$2,583',
            maxIncomeYear: 'listings.annualIncome*income:$31,000',
            sizeColumn: 2,
          },
          {
            maxIncomeMonth: 'listings.monthlyIncome*income:$2,667',
            maxIncomeYear: 'listings.annualIncome*income:$32,000',
            sizeColumn: 3,
          },
          {
            maxIncomeMonth: 'listings.monthlyIncome*income:$2,750',
            maxIncomeYear: 'listings.annualIncome*income:$33,000',
            sizeColumn: 4,
          },
          {
            maxIncomeMonth: 'listings.monthlyIncome*income:$2,833',
            maxIncomeYear: 'listings.annualIncome*income:$34,000',
            sizeColumn: 5,
          },
        ],
      });
    });
    it('should only have the highest chart data if min household is larger', () => {
      const result = generateHmiData(
        [unit],
        [{ min: 9, max: 11 }],
        [generateAmiChart()],
      );

      expect(result).toEqual({
        columns: {
          maxIncomeMonth: 'listings.maxIncomeMonth',
          maxIncomeYear: 'listings.maxIncomeYear',
          sizeColumn: 'listings.householdSize',
        },
        rows: [
          {
            maxIncomeMonth: 'listings.monthlyIncome*income:$3,083',
            maxIncomeYear: 'listings.annualIncome*income:$37,000',
            sizeColumn: 8,
          },
        ],
      });
    });
    it('should generate for more than 1 unit and amiChart ', () => {
      const result = generateHmiData(
        [
          unit,
          {
            ...unit,
            amiPercentage: '40',
            amiChart: {
              id: 'ami2',
              createdAt: new Date(),
              updatedAt: new Date(),
              items: [],
              name: 'ami2',
              jurisdictions: {
                id: 'id',
              },
            },
          },
        ],
        [
          { min: 1, max: 3 },
          { min: 5, max: 7 },
        ],
        [
          generateAmiChart(),
          {
            ...generateAmiChart(),
            id: 'ami2',
            items: generateAmiChartItems(8, 40, 40_000),
          },
        ],
      );

      expect(result).toEqual({
        columns: {
          ami30: 'listings.percentAMIUnit*percent:30',
          ami40: 'listings.percentAMIUnit*percent:40',
          sizeColumn: 'listings.householdSize',
        },
        rows: [
          {
            ami30: 'listings.annualIncome*income:$30,000',
            ami40: 'listings.annualIncome*income:$40,000',
            sizeColumn: 1,
          },
          {
            ami30: 'listings.annualIncome*income:$31,000',
            ami40: 'listings.annualIncome*income:$41,000',
            sizeColumn: 2,
          },
          {
            ami30: 'listings.annualIncome*income:$32,000',
            ami40: 'listings.annualIncome*income:$42,000',
            sizeColumn: 3,
          },
          {
            ami30: 'listings.annualIncome*income:$34,000',
            ami40: 'listings.annualIncome*income:$44,000',
            sizeColumn: 5,
          },
          {
            ami30: 'listings.annualIncome*income:$35,000',
            ami40: 'listings.annualIncome*income:$45,000',
            sizeColumn: 6,
          },
          {
            ami30: 'listings.annualIncome*income:$36,000',
            ami40: 'listings.annualIncome*income:$46,000',
            sizeColumn: 7,
          },
        ],
      });
    });
    it('should have bmr values', () => {
      const result = generateHmiData(
        [
          {
            ...unit,
            bmrProgramChart: true,
            unitTypes: {
              ...defaultValues,
              id: 'oneBed',
              name: 'oneBdrm',
              numBedrooms: 1,
            },
          },
        ],
        [{ min: 1, max: 3 }],
        [generateAmiChart()],
      );

      expect(result).toEqual({
        columns: {
          maxIncomeMonth: 'listings.maxIncomeMonth',
          maxIncomeYear: 'listings.maxIncomeYear',
          sizeColumn: 't.unitType',
        },
        rows: [
          {
            maxIncomeMonth: 'listings.monthlyIncome*income:$2,583',
            maxIncomeYear: 'listings.annualIncome*income:$31,000',
            sizeColumn: 'listings.unitTypes.oneBdrm',
          },
        ],
      });
    });
  });
  describe('convertToTitleCase', () => {
    it('should return empty string for empty input', () => {
      expect(convertToTitleCase('')).toBe('');
      expect(convertToTitleCase(null)).toBe('');
    });

    it('should convert camelCase to Title Case', () => {
      expect(convertToTitleCase('camelCase')).toBe('Camel Case');
      expect(convertToTitleCase('thisIsATest')).toBe('This Is A Test');
    });
  });

  describe('getRentTypes', () => {
    it('should return empty string for empty input', () => {
      expect(getRentTypes([])).toBe('');
      expect(getRentTypes(null)).toBe('');
    });

    it('should return unique rent types in title case', () => {
      const amiLevels = [
        { monthlyRentDeterminationType: 'fixedAmount' },
        { monthlyRentDeterminationType: 'percentageOfIncome' },
        { monthlyRentDeterminationType: 'fixedAmount' }, // duplicate
      ] as UnitGroupAmiLevel[];
      expect(getRentTypes(amiLevels)).toBe(
        'Fixed Amount, Percentage Of Income',
      );
    });
  });

  describe('formatRange', () => {
    it('should return empty string when both min and max are empty', () => {
      expect(formatRange('', '', '$', '')).toBe('');
      expect(formatRange(null, undefined, '$', '')).toBe('');
    });

    it('should return single value when min equals max', () => {
      expect(formatRange(100, 100, '$', '')).toBe('$100');
    });

    it('should return single value when max is empty', () => {
      expect(formatRange(100, '', '$', '')).toBe('$100');
    });

    it('should return max value when min is empty', () => {
      expect(formatRange('', 200, '$', '')).toBe('$200');
    });

    it('should format range with prefix and postfix', () => {
      expect(formatRange(100, 200, '$', '/mo')).toBe('$100/mo - $200/mo');
      expect(formatRange(50, 75, '', '%')).toBe('50% - 75%');
    });
  });

  describe('formatRentRange', () => {
    it('should return empty string when both rent and percent are empty', () => {
      expect(formatRentRange(null, null)).toBe('');
    });

    it('should format rent only', () => {
      const rent: MinMax = { min: 1000, max: 2000 };
      expect(formatRentRange(rent, null)).toBe('1000 - 2000');
    });

    it('should format percent only', () => {
      const percent: MinMax = { min: 30, max: 40 };
      expect(formatRentRange(null, percent)).toBe('30% - 40%');
    });

    it('should format both rent and percent', () => {
      const rent: MinMax = { min: 1000, max: 2000 };
      const percent: MinMax = { min: 30, max: 40 };
      expect(formatRentRange(rent, percent)).toBe('1000 - 2000, 30% - 40%');
    });

    it('should handle single values', () => {
      const rent: MinMax = { min: 1000, max: 1000 };
      const percent: MinMax = { min: 30, max: 30 };
      expect(formatRentRange(rent, percent)).toBe('1000, 30%');
    });
  });
});

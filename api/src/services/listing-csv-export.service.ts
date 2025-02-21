import archiver from 'archiver';
import fs, { createReadStream } from 'fs';
import { join } from 'path';
import {
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  StreamableFile,
} from '@nestjs/common';
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';
import {
  ApplicationMethodsTypeEnum,
  ListingEventsTypeEnum,
} from '@prisma/client';
import { views } from './listing.service';
import { PrismaService } from './prisma.service';
import {
  CsvExporterServiceInterface,
  CsvHeader,
} from '../types/CsvExportInterface';
import { ListingCsvQueryParams } from '../dtos/listings/listing-csv-query-params.dto';
import { User } from '../dtos/users/user.dto';
import { formatLocalDate } from '../utilities/format-local-date';
import { FeatureFlagEnum } from '../enums/feature-flags/feature-flags-enum';
import { ListingReviewOrder } from '../enums/listings/review-order-enum';
import { isEmpty } from '../utilities/is-empty';
import { ListingEvent } from '../dtos/listings/listing-event.dto';
import { ApplicationMethod } from '../dtos/application-methods/application-method.dto';
import Unit from '../dtos/units/unit.dto';
import Listing from '../dtos/listings/listing.dto';
import { mapTo } from '../utilities/mapTo';
import { ListingMultiselectQuestion } from '../dtos/listings/listing-multiselect-question.dto';
import { Jurisdiction } from '../dtos/jurisdictions/jurisdiction.dto';
import { ListingUtilities } from '../dtos/listings/listing-utility.dto';
import { ListingFeatures } from '../dtos/listings/listing-feature.dto';

views.csv = {
  ...views.details,
  copyOf: {
    select: {
      id: true,
    },
  },
  userAccounts: true,
};

export const formatStatus = {
  active: 'Public',
  closed: 'Closed',
  pending: 'Draft',
  pendingReview: 'Pending Review',
  changesRequested: 'Changes Requested',
};

export const formatCommunityType = {
  senior55: 'Seniors 55+',
  senior62: 'Seniors 62+',
  specialNeeds: 'Special Needs',
};

@Injectable()
export class ListingCsvExporterService implements CsvExporterServiceInterface {
  readonly dateFormat: string = 'MM-DD-YYYY hh:mm:ssA z';
  timeZone = process.env.TIME_ZONE;
  constructor(
    private prisma: PrismaService,
    @Inject(Logger)
    private logger = new Logger(ListingCsvExporterService.name),
  ) {}

  /**
   *
   * @param queryParams
   * @param req
   * @returns a promise containing a streamable file
   */
  async exportFile<QueryParams extends ListingCsvQueryParams>(
    req: ExpressRequest,
    res: ExpressResponse,
    queryParams: QueryParams,
  ): Promise<StreamableFile> {
    this.logger.warn('Generating Listing-Unit Zip');
    const user = mapTo(User, req['user']);
    await this.authorizeCSVExport(user);

    const zipFileName = `listings-units-${user.id}-${new Date().getTime()}.zip`;
    const zipFilePath = join(process.cwd(), `src/temp/${zipFileName}`);
    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename: ${zipFileName}`,
    });

    const listingFilePath = join(
      process.cwd(),
      `src/temp/listings-${user.id}-${new Date().getTime()}.csv`,
    );
    const unitFilePath = join(
      process.cwd(),
      `src/temp/units-${user.id}-${new Date().getTime()}.csv`,
    );

    if (queryParams.timeZone) {
      this.timeZone = queryParams.timeZone;
    }

    const whereClause = {
      jurisdictions: {
        OR: [],
      },
    };

    user.jurisdictions?.forEach((jurisdiction) => {
      whereClause.jurisdictions.OR.push({
        id: jurisdiction.id,
      });
    });

    const listings = await this.prisma.listings.findMany({
      include: views.csv,
      where: whereClause,
    });

    await this.createCsv(listingFilePath, queryParams, {
      listings: listings as unknown as Listing[],
      user,
    });
    const listingCsv = createReadStream(listingFilePath);

    await this.createUnitCsv(unitFilePath, listings as unknown as Listing[]);
    const unitCsv = createReadStream(unitFilePath);
    return new Promise((resolve) => {
      // Create a writable stream to the zip file
      const output = fs.createWriteStream(zipFilePath);
      const archive = archiver('zip', {
        zlib: { level: 9 },
      });
      output.on('close', () => {
        const zipFile = createReadStream(zipFilePath);
        resolve(new StreamableFile(zipFile));
      });

      archive.pipe(output);
      archive.append(listingCsv, { name: 'listings.csv' });
      archive.append(unitCsv, { name: 'units.csv' });
      archive.finalize();
    });
  }

  /**
   *
   * @param filename
   * @param queryParams
   * @returns a promise with SuccessDTO
   */
  async createCsv<QueryParams extends ListingCsvQueryParams>(
    filename: string,
    queryParams: QueryParams,
    optionParams: { listings: Listing[]; user: User },
  ): Promise<void> {
    const csvHeaders = await this.getCsvHeaders(optionParams.user);

    return new Promise((resolve, reject) => {
      // create stream
      const writableStream = fs.createWriteStream(`${filename}`);
      writableStream
        .on('error', (err) => {
          console.log('csv writestream error');
          console.log(err);
          reject(err);
        })
        .on('close', () => {
          resolve();
        })
        .on('open', () => {
          writableStream.write(
            csvHeaders.map((header) => header.label).join(',') + '\n',
          );

          // now loop over listings and write them to file
          optionParams.listings.forEach((listing) => {
            let row = '';
            csvHeaders.forEach((header, index) => {
              let value = header.path.split('.').reduce((acc, curr) => {
                // handles working with arrays, e.g. householdMember.0.firstName
                if (!isNaN(Number(curr))) {
                  const index = Number(curr);
                  return acc[index];
                }

                if (acc === null || acc === undefined) {
                  return '';
                }
                return acc[curr];
              }, listing);
              value = value === undefined ? '' : value === null ? '' : value;
              if (header.format) {
                value = header.format(value, listing);
              }

              row += value ? `"${value.toString().replace(/"/g, `""`)}"` : '';
              if (index < csvHeaders.length - 1) {
                row += ',';
              }
            });

            try {
              writableStream.write(row + '\n');
            } catch (e) {
              console.log('writeStream write error = ', e);
              writableStream.once('drain', () => {
                writableStream.write(row + '\n');
              });
            }
          });

          writableStream.end();
        });
    });
  }

  async createUnitCsv(filename: string, listings: Listing[]): Promise<void> {
    const csvHeaders = this.getUnitCsvHeaders();
    // flatten those listings
    const units = listings.flatMap((listing) =>
      listing.units.map((unit) => ({
        listing: {
          id: listing.id,
          name: listing.name,
        },
        unit,
      })),
    );
    // TODO: the below is essentially the same as above in this.createCsv
    return new Promise((resolve, reject) => {
      const writableStream = fs.createWriteStream(`${filename}`);
      writableStream
        .on('error', (err) => {
          console.log('csv writestream error');
          console.log(err);
          reject(err);
        })
        .on('close', () => {
          resolve();
        })
        .on('open', () => {
          writableStream.write(
            csvHeaders.map((header) => header.label).join(',') + '\n',
          );
          units.forEach((unit) => {
            let row = '';
            csvHeaders.forEach((header, index) => {
              let value = header.path.split('.').reduce((acc, curr) => {
                // handles working with arrays, e.g. householdMember.0.firstName
                if (!isNaN(Number(curr))) {
                  const index = Number(curr);
                  return acc[index];
                }

                if (acc === null || acc === undefined) {
                  return '';
                }
                return acc[curr];
              }, unit);
              value = value === undefined ? '' : value === null ? '' : value;
              if (header.format) {
                value = header.format(value);
              }

              row += value;
              if (index < csvHeaders.length - 1) {
                row += ',';
              }
            });

            try {
              writableStream.write(row + '\n');
            } catch (e) {
              console.log('writeStream write error = ', e);
              writableStream.once('drain', () => {
                writableStream.write(row + '\n');
              });
            }
          });

          writableStream.end();
        });
    });
  }

  formatCurrency(value: string): string {
    return value ? `$${value}` : '';
  }

  cloudinaryPdfFromId(publicId: string, listing?: Listing): string {
    if (publicId) {
      const cloudName =
        process.env.cloudinaryCloudName || process.env.CLOUDINARY_CLOUD_NAME;
      return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}.pdf`;
    } else if (!publicId && listing?.buildingSelectionCriteria) {
      return listing.buildingSelectionCriteria;
    }

    return '';
  }

  formatYesNo = (value: boolean | null): string => {
    if (value === null || typeof value == 'undefined') return '';
    else if (value) return 'Yes';
    else return 'No';
  };

  hideZero = (fieldValue: number | string) => {
    if (isEmpty(fieldValue) || fieldValue === 0 || fieldValue === '0')
      return '';
    return fieldValue;
  };

  doAnyJurisdictionHaveFeatureFlagSet = (
    jurisdictions: Jurisdiction[],
    featureFlagName: string,
  ) => {
    return jurisdictions.some((juris) => {
      return juris.featureFlags.some(
        (flag) => flag.name === featureFlagName && flag.active,
      );
    });
  };

  async getCsvHeaders(user: User): Promise<CsvHeader[]> {
    const headers: CsvHeader[] = [
      {
        path: 'id',
        label: 'Listing Id',
      },
      {
        path: 'createdAt',
        label: 'Created At Date',
        format: (val: string): string =>
          formatLocalDate(val, this.dateFormat, this.timeZone),
      },
      {
        path: 'jurisdictions.name',
        label: 'Jurisdiction',
      },
      {
        path: 'name',
        label: 'Listing Name',
      },
      {
        path: 'status',
        label: 'Listing Status',
        format: (val: string): string => formatStatus[val],
      },
      {
        path: 'publishedAt',
        label: 'Publish Date',
        format: (val: string): string =>
          formatLocalDate(val, this.dateFormat, this.timeZone),
      },
      {
        path: 'updatedAt',
        label: 'Last Updated',
        format: (val: string): string =>
          formatLocalDate(val, this.dateFormat, this.timeZone),
      },
      {
        path: 'copyOf',
        label: 'Copy or Original',
        format: (val: Listing): string => (val ? 'Copy' : 'Original'),
      },
      {
        path: 'copyOfId',
        label: 'Copied From',
        format: (val: string): string => val,
      },
      {
        path: 'developer',
        label: 'Developer',
      },
      {
        path: 'listingsBuildingAddress.street',
        label: 'Building Street Address',
      },
      {
        path: 'listingsBuildingAddress.city',
        label: 'Building City',
      },
      {
        path: 'listingsBuildingAddress.state',
        label: 'Building State',
      },
      {
        path: 'listingsBuildingAddress.zipCode',
        label: 'Building Zip',
      },
      {
        path: 'neighborhood',
        label: 'Building Neighborhood',
      },
      {
        path: 'yearBuilt',
        label: 'Building Year Built',
      },
      {
        path: 'reservedCommunityTypes.name',
        label: 'Reserved Community Types',
        format: (val: string): string => formatCommunityType[val] || '',
      },
      {
        path: 'listingsBuildingAddress.latitude',
        label: 'Latitude',
      },
      {
        path: 'listingsBuildingAddress.longitude',
        label: 'Longitude',
      },
    ];

    if (
      this.doAnyJurisdictionHaveFeatureFlagSet(
        user.jurisdictions,
        FeatureFlagEnum.enableHomeType,
      )
    ) {
      headers.push({
        path: 'homeType',
        label: 'Home Type',
      });
    }
    if (
      this.doAnyJurisdictionHaveFeatureFlagSet(
        user.jurisdictions,
        FeatureFlagEnum.enableSection8Question,
      )
    ) {
      headers.push({
        path: 'section8Acceptance',
        label: 'Accept Section 8',
        format: this.formatYesNo,
      });
    }
    if (
      this.doAnyJurisdictionHaveFeatureFlagSet(
        user.jurisdictions,
        FeatureFlagEnum.enableUtilitiesIncluded,
      )
    ) {
      headers.push({
        path: 'listingUtilities',
        label: 'Utilities Included',
        format: (val: ListingUtilities): string => {
          if (!val) return '';
          const selectedValues = Object.entries(val).reduce(
            (combined, entry) => {
              if (entry[1] === true) {
                combined.push(entry[0]);
              }
              return combined;
            },
            [],
          );
          return selectedValues.join(', ');
        },
      });
    }
    if (
      this.doAnyJurisdictionHaveFeatureFlagSet(
        user.jurisdictions,
        FeatureFlagEnum.enableAccessibilityFeatures,
      )
    ) {
      headers.push({
        path: 'listingFeatures',
        label: 'Property Amenities',
        format: (val: ListingFeatures): string => {
          if (!val) return '';
          const selectedValues = Object.entries(val).reduce(
            (combined, entry) => {
              if (entry[1] === true) {
                combined.push(entry[0]);
              }
              return combined;
            },
            [],
          );
          return selectedValues.join(', ');
        },
      });
    }

    headers.push(
      ...[
        {
          path: 'units.length',
          label: 'Number of Units',
        },
        {
          path: 'reviewOrderType',
          label: 'Listing Availability',
          format: (val: string): string =>
            val === ListingReviewOrder.waitlist
              ? 'Open Waitlist'
              : 'Available Units',
        },
        {
          path: 'reviewOrderType',
          label: 'Review Order',
          format: (val: string): string => {
            if (!val) return '';
            const spacedValue = val.replace(/([A-Z])/g, (match) => ` ${match}`);
            const result =
              spacedValue.charAt(0).toUpperCase() + spacedValue.slice(1);
            return result;
          },
        },
        {
          path: 'listingEvents',
          label: 'Lottery Date',
          format: (val: ListingEvent[]): string => {
            if (!val) return '';
            const lottery = val.filter(
              (event) => event.type === ListingEventsTypeEnum.publicLottery,
            );
            return lottery.length
              ? formatLocalDate(
                  lottery[0].startTime,
                  'MM-DD-YYYY',
                  this.timeZone,
                )
              : '';
          },
        },
        {
          path: 'listingEvents',
          label: 'Lottery Start',
          format: (val: ListingEvent[]): string => {
            if (!val) return '';
            const lottery = val.filter(
              (event) => event.type === ListingEventsTypeEnum.publicLottery,
            );
            return lottery.length
              ? formatLocalDate(lottery[0].startTime, 'hh:mmA z', this.timeZone)
              : '';
          },
        },
        {
          path: 'listingEvents',
          label: 'Lottery End',
          format: (val: ListingEvent[]): string => {
            if (!val) return '';
            const lottery = val.filter(
              (event) => event.type === ListingEventsTypeEnum.publicLottery,
            );
            return lottery.length
              ? formatLocalDate(lottery[0].endTime, 'hh:mmA z', this.timeZone)
              : '';
          },
        },
        {
          path: 'listingEvents',
          label: 'Lottery Notes',
          format: (val: ListingEvent[]): string => {
            if (!val) return '';
            const lottery = val.filter(
              (event) => event.type === ListingEventsTypeEnum.publicLottery,
            );
            return lottery.length ? lottery[0].note : '';
          },
        },
        {
          path: 'listingMultiselectQuestions',
          label: 'Housing Preferences',
          format: (val: ListingMultiselectQuestion[]): string => {
            return val
              .filter(
                (question) =>
                  question.multiselectQuestions.applicationSection ===
                  'preferences',
              )
              .map((question) => question.multiselectQuestions.text)
              .join(',');
          },
        },
        {
          path: 'listingMultiselectQuestions',
          label: 'Housing Programs',
          format: (val: ListingMultiselectQuestion[]): string => {
            return val
              .filter(
                (question) =>
                  question.multiselectQuestions.applicationSection ===
                  'programs',
              )
              .map((question) => question.multiselectQuestions.text)
              .join(',');
          },
        },
        {
          path: 'applicationFee',
          label: 'Application Fee',
          format: this.formatCurrency,
        },
        {
          path: 'depositHelperText',
          label: 'Deposit Helper Text',
        },
        {
          path: 'depositMin',
          label: 'Deposit Min',
          format: this.formatCurrency,
        },
        {
          path: 'depositMax',
          label: 'Deposit Max',
          format: this.formatCurrency,
        },
        {
          path: 'costsNotIncluded',
          label: 'Costs Not Included',
        },
        {
          path: 'amenities',
          label: 'Property Amenities',
        },
        {
          path: 'accessibility',
          label: 'Additional Accessibility',
        },
        {
          path: 'unitAmenities',
          label: 'Unit Amenities',
        },
        {
          path: 'smokingPolicy',
          label: 'Smoking Policy',
        },
        {
          path: 'petPolicy',
          label: 'Pets Policy',
        },
        {
          path: 'servicesOffered',
          label: 'Services Offered',
        },
        {
          path: 'creditHistory',
          label: 'Eligibility Rules - Credit History',
        },
        {
          path: 'rentalHistory',
          label: 'Eligibility Rules - Rental History',
        },
        {
          path: 'criminalBackground',
          label: 'Eligibility Rules - Criminal Background',
        },
        {
          path: 'rentalAssistance',
          label: 'Eligibility Rules - Rental Assistance',
        },
        {
          path: 'buildingSelectionCriteriaFileId',
          label: 'Building Selection Criteria',
          format: this.cloudinaryPdfFromId,
        },
        {
          path: 'programRules',
          label: 'Important Program Rules',
        },
        {
          path: 'requiredDocuments',
          label: 'Required Documents',
        },
        {
          path: 'specialNotes',
          label: 'Special Notes',
        },
        {
          path: 'isWaitlistOpen',
          label: 'Waitlist',
          format: this.formatYesNo,
        },
        {
          path: 'leasingAgentName',
          label: 'Leasing Agent Name',
        },
        {
          path: 'leasingAgentEmail',
          label: 'Leasing Agent Email',
        },
        {
          path: 'leasingAgentPhone',
          label: 'Leasing Agent Phone',
        },
        {
          path: 'leasingAgentTitle',
          label: 'Leasing Agent Title',
        },
        {
          path: 'leasingAgentOfficeHours',
          label: 'Leasing Agent Office Hours',
        },
        {
          path: 'listingsLeasingAgentAddress.street',
          label: 'Leasing Agent Street Address',
        },
        {
          path: 'listingsLeasingAgentAddress.street2',
          label: 'Leasing Agent Apt/Unit #',
        },
        {
          path: 'listingsLeasingAgentAddress.city',
          label: 'Leasing Agent City',
        },
        {
          path: 'listingsLeasingAgentAddress.state',
          label: 'Leasing Agent State',
        },
        {
          path: 'listingsLeasingAgentAddress.zipCode',
          label: 'Leasing Agent Zip',
        },
        {
          path: 'listingsLeasingAgentAddress.street',
          label: 'Leasing Agency Mailing Address',
        },
        {
          path: 'listingsLeasingAgentAddress.street2',
          label: 'Leasing Agency Mailing Address Street 2',
        },
        {
          path: 'listingsLeasingAgentAddress.city',
          label: 'Leasing Agency Mailing Address City',
        },
        {
          path: 'listingsLeasingAgentAddress.state',
          label: 'Leasing Agency Mailing Address State',
        },
        {
          path: 'listingsLeasingAgentAddress.zipCode',
          label: 'Leasing Agency Mailing Address Zip',
        },
        {
          path: 'listingsApplicationPickUpAddress.street',
          label: 'Leasing Agency Pickup Address',
        },
        {
          path: 'listingsApplicationPickUpAddress.street2',
          label: 'Leasing Agency Pickup Address Street 2',
        },
        {
          path: 'listingsApplicationPickUpAddress.city',
          label: 'Leasing Agency Pickup Address City',
        },
        {
          path: 'listingsApplicationPickUpAddress.state',
          label: 'Leasing Agency Pickup Address State',
        },
        {
          path: 'listingsApplicationPickUpAddress.zipCode',
          label: 'Leasing Agency Pickup Address Zip',
        },
        {
          path: 'applicationPickUpAddressOfficeHours',
          label: 'Leasing Pick Up Office Hours',
        },
        {
          path: 'digitalApplication',
          label: 'Digital Application',
          format: this.formatYesNo,
        },
        {
          path: 'applicationMethods',
          label: 'Digital Application URL',
          format: (val: ApplicationMethod[]): string => {
            const method = val.filter(
              (appMethod) =>
                appMethod.type === ApplicationMethodsTypeEnum.ExternalLink,
            );
            return method.length ? method[0].externalReference : '';
          },
        },
        {
          path: 'paperApplication',
          label: 'Paper Application',
          format: this.formatYesNo,
        },
        {
          path: 'applicationMethods',
          label: 'Paper Application URL',
          format: (val: ApplicationMethod[]): string => {
            const method = val.filter(
              (appMethod) => appMethod.paperApplications.length > 0,
            );
            const paperApps = method.length ? method[0].paperApplications : [];
            return paperApps.length
              ? paperApps
                  .map((app) => this.cloudinaryPdfFromId(app.assets.fileId))
                  .join(', ')
              : '';
          },
        },
        {
          path: 'referralOpportunity',
          label: 'Referral Opportunity',
          format: this.formatYesNo,
        },
        {
          path: 'applicationMailingAddressId',
          label: 'Can applications be mailed in?',
          format: this.formatYesNo,
        },
        {
          path: 'applicationPickUpAddressId',
          label: 'Can applications be picked up?',
          format: this.formatYesNo,
        },
        {
          path: 'applicationPickUpAddressId',
          label: 'Can applications be dropped off?',
          format: this.formatYesNo,
        },
        {
          path: 'postmarkedApplicationsReceivedByDate',
          label: 'Postmark',
          format: (val: string): string =>
            formatLocalDate(val, this.dateFormat, this.timeZone),
        },
        {
          path: 'additionalApplicationSubmissionNotes',
          label: 'Additional Application Submission Notes',
        },
        {
          path: 'applicationDueDate',
          label: 'Application Due Date',
          format: (val: string): string =>
            formatLocalDate(val, 'MM-DD-YYYY', this.timeZone),
        },
        {
          path: 'applicationDueDate',
          label: 'Application Due Time',
          format: (val: string): string =>
            formatLocalDate(val, 'hh:mmA z', this.timeZone),
        },
        {
          path: 'listingEvents',
          label: 'Open House',
          format: (val: ListingEvent[]): string => {
            if (!val) return '';
            return val
              .filter((event) => event.type === ListingEventsTypeEnum.openHouse)
              .map((event) => {
                let openHouseStr = '';
                if (event.label) openHouseStr += `${event.label}`;
                if (event.startTime) {
                  const date = formatLocalDate(
                    event.startTime,
                    'MM-DD-YYYY',
                    this.timeZone,
                  );
                  openHouseStr += `: ${date}`;
                  if (event.endTime) {
                    const startTime = formatLocalDate(
                      event.startTime,
                      'hh:mmA',
                      this.timeZone,
                    );
                    const endTime = formatLocalDate(
                      event.endTime,
                      'hh:mmA z',
                      this.timeZone,
                    );
                    openHouseStr += ` (${startTime} - ${endTime})`;
                  }
                }
                return openHouseStr;
              })
              .filter((str) => str.length)
              .join(', ');
          },
        },
        {
          path: 'userAccounts',
          label: 'Partners Who Have Access',
          format: (val: User[]): string =>
            val.map((user) => `${user.firstName} ${user.lastName}`).join(', '),
        },
      ],
    );

    return headers;
  }

  getUnitCsvHeaders(): CsvHeader[] {
    return [
      {
        path: 'listing.id',
        label: 'Listing Id',
      },
      {
        path: 'listing.name',
        label: 'Listing Name',
      },
      {
        path: 'unit.number',
        label: 'Unit Number',
      },
      {
        path: 'unit.unitTypes.name',
        label: 'Unit Type',
      },
      {
        path: 'unit.numBathrooms',
        label: 'Number of Bathrooms',
      },
      {
        path: 'unit.floor',
        label: 'Unit Floor',
        format: this.hideZero,
      },
      {
        path: 'unit.sqFeet',
        label: 'Square Footage',
      },
      {
        path: 'unit.minOccupancy',
        label: 'Minimum Occupancy',
        format: this.hideZero,
      },
      {
        path: 'unit.maxOccupancy',
        label: 'Max Occupancy',
        format: this.hideZero,
      },
      {
        path: 'unit.amiChart.name',
        label: 'AMI Chart',
      },
      {
        path: 'unit.amiPercentage',
        label: 'AMI Level',
      },
      {
        path: 'unit',
        label: 'Rent Type',
        format: (val: Unit) =>
          !isEmpty(val.monthlyRentAsPercentOfIncome)
            ? '% of income'
            : !isEmpty(val.monthlyRent)
            ? 'Fixed amount'
            : '',
      },
    ];
  }

  async authorizeCSVExport(user?: User): Promise<void> {
    if (
      user &&
      (user.userRoles?.isAdmin ||
        user.userRoles?.isJurisdictionalAdmin ||
        user.userRoles?.isPartner)
    ) {
      return;
    } else {
      throw new ForbiddenException();
    }
  }
}

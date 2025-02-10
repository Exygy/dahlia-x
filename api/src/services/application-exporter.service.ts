import { Injectable, StreamableFile } from '@nestjs/common';
import { MultiselectQuestionsApplicationSectionEnum } from '@prisma/client';
import dayjs from 'dayjs';
import Excel, { Column } from 'exceljs';
import { Request as ExpressRequest } from 'express';
import fs, { createReadStream, ReadStream } from 'fs';
import { join } from 'path';
import { view } from './application.service';
import { Application } from '../dtos/applications/application.dto';
import { ApplicationCsvQueryParams } from '../dtos/applications/application-csv-query-params.dto';
import { MultiselectQuestion } from '../dtos/multiselect-questions/multiselect-question.dto';
import { ApplicationMultiselectQuestion } from '../dtos/applications/application-multiselect-question.dto';
import { IdDTO } from '../dtos/shared/id.dto';
import { User } from '../dtos/users/user.dto';
import { OrderByEnum } from '../enums/shared/order-by-enum';
import { permissionActions } from '../enums/permissions/permission-actions-enum';
import { ListingService } from './listing.service';
import { MultiselectQuestionService } from './multiselect-question.service';
import { PermissionService } from './permission.service';
import { PrismaService } from './prisma.service';
import { CsvHeader } from '../types/CsvExportInterface';
import { getExportHeaders } from '../utilities/application-export-helpers';
import { mapTo } from '../utilities/mapTo';
import { zipExport } from '../utilities/zip-export';

view.csv = {
  ...view.details,
  applicationFlaggedSet: {
    select: {
      id: true,
    },
  },
  listings: false,
};
const NUMBER_TO_PAGINATE_BY = 500;

@Injectable()
export class ApplicationExporterService {
  readonly dateFormat: string = 'MM-DD-YYYY hh:mm:ssA z';
  constructor(
    private prisma: PrismaService,
    private multiselectQuestionService: MultiselectQuestionService,
    private listingService: ListingService,
    private permissionService: PermissionService,
  ) {}

  /**
   *
   * @param req
   * @param queryParams
   * @param isLottery a boolean indicating if the export is a lottery
   * @param isSpreadsheet a boolean indicating if the export is a spreadsheet
   * @returns a promise containing a streamable file
   */
  async exporter<QueryParams extends ApplicationCsvQueryParams>(
    req: ExpressRequest,
    queryParams: QueryParams,
    isLottery: boolean,
    isSpreadsheet: boolean,
  ): Promise<StreamableFile> {
    const user = mapTo(User, req['user']);
    await this.authorizeExport(user, queryParams.id);

    let filename: string;
    let readStream: ReadStream;
    let zipFilename: string;
    const now = new Date();
    const dateString = dayjs(now).format('YYYY-MM-DD_HH-mm');
    if (isLottery) {
      readStream = await this.spreadsheetExport(queryParams, user.id, true);
      zipFilename = `listing-${queryParams.id}-lottery-${
        user.id
      }-${now.getTime()}`;
      filename = `lottery-${queryParams.id}-${dateString}`;
    } else {
      if (isSpreadsheet) {
        readStream = await this.spreadsheetExport(queryParams, user.id, false);
      } else {
        readStream = await this.csvExport(queryParams, user.id);
      }
      zipFilename = `listing-${queryParams.id}-applications-${
        user.id
      }-${now.getTime()}`;
      filename = `applications-${queryParams.id}-${dateString}`;
    }

    return await zipExport(readStream, zipFilename, filename, isSpreadsheet);
  }

  // csv export functions
  /**
   *
   * @param queryParams
   * @param user_id
   * @returns a promise containing a file read stream
   */
  async csvExport<QueryParams extends ApplicationCsvQueryParams>(
    queryParams: QueryParams,
    user_id: string,
  ): Promise<ReadStream> {
    const filename = join(
      process.cwd(),
      `src/temp/listing-${
        queryParams.id
      }-applications-${user_id}-${new Date().getTime()}.csv`,
    );

    await this.createCsv(filename, queryParams);
    return createReadStream(filename);
  }

  /**
   *
   * @param filename
   * @param queryParams
   * @returns a promise with SuccessDTO
   */
  async createCsv<QueryParams extends ApplicationCsvQueryParams>(
    filename: string,
    queryParams: QueryParams,
  ): Promise<void> {
    const applications = await this.prisma.applications.findMany({
      select: {
        id: true,
        householdMember: {
          select: {
            id: true,
          },
        },
      },
      where: {
        listingId: queryParams.id,
        deletedAt: null,
      },
    });

    // get all multiselect questions for a listing to build csv headers
    const multiSelectQuestions =
      await this.multiselectQuestionService.findByListingId(queryParams.id);

    // get maxHouseholdMembers associated to the selected applications
    let maxHouseholdMembers = 0;
    applications.forEach((app) => {
      if (app.householdMember?.length > maxHouseholdMembers) {
        maxHouseholdMembers = app.householdMember.length;
      }
    });

    const csvHeaders = getExportHeaders(
      maxHouseholdMembers,
      multiSelectQuestions,
      queryParams.timeZone,
      queryParams.includeDemographics,
      false,
      this.dateFormat,
    );

    return this.csvExportHelper(
      filename,
      mapTo(Application, applications),
      csvHeaders,
      queryParams,
    );
  }

  /**
   *
   * @param filename the name of the file to write to
   * @param applications the full list of partial applications
   * @param csvHeaders the headers and renderers of the csv
   * @param queryParams the incoming param args
   * @param forLottery whether we are getting the lottery results or not
   * @returns void but writes the output to a file
   */
  csvExportHelper(
    filename: string,
    applications: Application[],
    csvHeaders: CsvHeader[],
    queryParams: ApplicationCsvQueryParams,
    forLottery = false,
  ): Promise<void> {
    return new Promise(async (resolve, reject) => {
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
        .on('open', async () => {
          writableStream.write(
            csvHeaders
              .map((header) => `"${header.label.replace(/"/g, `""`)}"`)
              .join(',') + '\n',
          );

          const promiseArray: Promise<string>[] = [];
          for (let i = 0; i < applications.length; i += NUMBER_TO_PAGINATE_BY) {
            promiseArray.push(
              new Promise(async (resolve) => {
                // grab applications NUMBER_TO_PAGINATE_BY at a time
                let paginatedApplications =
                  await this.prisma.applications.findMany({
                    include: {
                      ...view.csv,
                      demographics: queryParams.includeDemographics
                        ? {
                            select: {
                              id: true,
                              createdAt: true,
                              updatedAt: true,
                              ethnicity: true,
                              gender: true,
                              sexualOrientation: true,
                              howDidYouHear: true,
                              race: true,
                            },
                          }
                        : false,
                      applicationLotteryPositions: forLottery
                        ? {
                            select: {
                              ordinal: true,
                            },
                            where: {
                              multiselectQuestionId: null,
                            },
                          }
                        : false,
                    },
                    where: {
                      listingId: queryParams.id,
                      deletedAt: null,
                      markedAsDuplicate: forLottery ? false : undefined,
                      id: {
                        in: applications
                          .slice(i, i + NUMBER_TO_PAGINATE_BY)
                          .map((app) => app.id),
                      },
                    },
                  });
                if (forLottery) {
                  paginatedApplications = paginatedApplications.sort(
                    (a, b) =>
                      a.applicationLotteryPositions[0].ordinal -
                      b.applicationLotteryPositions[0].ordinal,
                  );
                }
                let row = '';
                paginatedApplications.forEach((app) => {
                  let preferences: ApplicationMultiselectQuestion[];
                  let programs: ApplicationMultiselectQuestion[];
                  csvHeaders.forEach((header, index) => {
                    let multiselectQuestionValue = false;
                    let parsePreference = false;
                    let parseProgram = false;
                    let value = header.path.split('.').reduce((acc, curr) => {
                      // return preference/program as value for the format function to accept
                      if (multiselectQuestionValue) {
                        return acc;
                      }

                      if (parsePreference) {
                        // curr should equal the preference id we're pulling from
                        if (!preferences) {
                          preferences =
                            app.preferences as unknown as ApplicationMultiselectQuestion[];
                        }
                        parsePreference = false;
                        // there aren't typically many preferences, but if there, then a object map should be created and used
                        const preference = preferences.find(
                          (preference) =>
                            preference.multiselectQuestionId === curr ||
                            preference.key === curr,
                        );
                        multiselectQuestionValue = true;
                        return preference;
                      } else if (parseProgram) {
                        // curr should equal the preference id we're pulling from
                        if (!programs) {
                          programs =
                            (app.programs as unknown as ApplicationMultiselectQuestion[]) ||
                            [];
                        }
                        parsePreference = false;
                        // there aren't typically many programs, but if there, then a object map should be created and used
                        const program = programs.find(
                          (prog) => prog.key === curr,
                        );
                        multiselectQuestionValue = true;
                        return program;
                      }

                      // sets parsePreference to true, for the next iteration
                      if (curr === 'preferences') {
                        parsePreference = true;
                      } else if (curr === 'programs') {
                        parseProgram = true;
                      }

                      if (acc === null || acc === undefined) {
                        return '';
                      }

                      // handles working with arrays, e.g. householdMember.0.firstName
                      if (!isNaN(Number(curr))) {
                        const index = Number(curr);
                        return acc[index];
                      }

                      return acc[curr];
                    }, app);
                    if (value === undefined) {
                      value = '';
                    } else if (value === null) {
                      value = '';
                    }

                    if (header.format) {
                      value = header.format(value);
                    }

                    row += value
                      ? `"${value.toString().replace(/"/g, `""`)}"`
                      : '';
                    if (index < csvHeaders.length - 1) {
                      row += ',';
                    }
                  });
                  row += '\n';
                });
                resolve(row);
              }),
            );
          }
          const resolvedArray = await Promise.all(promiseArray);
          // now loop over batched row data and write them to file
          resolvedArray.forEach((row) => {
            try {
              writableStream.write(row);
            } catch (e) {
              console.log('writeStream write error = ', e);
              writableStream.once('drain', () => {
                console.log('drain buffer');
                writableStream.write(row + '\n');
              });
            }
          });
          writableStream.end();
        });
    });
  }

  // spreadsheet export functions
  /**
   *
   * @param queryParams
   * @param user
   * @param forLottery
   * @returns generates the applications or lottery spreadsheet export and returns a promise containing a file read stream
   */
  async spreadsheetExport<QueryParams extends ApplicationCsvQueryParams>(
    queryParams: QueryParams,
    user_id: string,
    forLottery = true,
  ): Promise<ReadStream> {
    const filename = join(
      process.cwd(),
      `src/temp/${forLottery ? 'lottery-' : ''}listing-${
        queryParams.id
      }-applications-${user_id}-${new Date().getTime()}.xlsx`,
    );

    const workbook = new Excel.stream.xlsx.WorkbookWriter({
      filename,
      useSharedStrings: false,
    });

    await this.createSpreadsheets(
      workbook,
      {
        ...queryParams,
      },
      forLottery,
    );

    await workbook.commit();
    return createReadStream(filename);
  }

  /**
   *
   * @param filename
   * @param queryParams
   * @param forLottery whether this is for a lottery export or not
   * @returns generates the lottery sheets
   */
  async createSpreadsheets<QueryParams extends ApplicationCsvQueryParams>(
    workbook: Excel.stream.xlsx.WorkbookWriter,
    queryParams: QueryParams,
    forLottery = false,
  ): Promise<void> {
    let applications = await this.prisma.applications.findMany({
      select: {
        id: true,
        preferences: true,
        householdMember: {
          select: {
            id: true,
          },
        },
        applicationLotteryPositions: forLottery
          ? {
              select: {
                ordinal: true,
                multiselectQuestionId: true,
              },
              where: {
                multiselectQuestionId: null,
              },
              orderBy: {
                ordinal: OrderByEnum.DESC,
              },
            }
          : undefined,
      },
      where: {
        listingId: queryParams.id,
        deletedAt: null,
        markedAsDuplicate: forLottery ? false : undefined,
      },
    });
    // get all multiselect questions for a listing to build csv headers
    const multiSelectQuestions =
      await this.multiselectQuestionService.findByListingId(queryParams.id);

    // get maxHouseholdMembers associated to the selected applications
    let maxHouseholdMembers = 0;
    applications.forEach((app) => {
      if (app.householdMember?.length > maxHouseholdMembers) {
        maxHouseholdMembers = app.householdMember.length;
      }
    });

    const columns = getExportHeaders(
      maxHouseholdMembers,
      multiSelectQuestions,
      queryParams.timeZone,
      queryParams.includeDemographics,
      forLottery,
    );

    if (forLottery) {
      applications = applications.filter(
        (elem) => !!elem.applicationLotteryPositions?.length,
      );

      applications = applications.sort(
        (a, b) =>
          a.applicationLotteryPositions[0].ordinal -
          b.applicationLotteryPositions[0].ordinal,
      );
    }
    const mappedApps = mapTo(Application, applications);

    await this.generateSpreadsheetData(
      workbook,
      mappedApps,
      columns,
      queryParams,
      forLottery,
    );

    if (forLottery) {
      const sortedPreferences = await this.sortPreferencesByOrdinal(
        multiSelectQuestions,
        queryParams.id,
      );

      for (const preference of sortedPreferences) {
        await this.generateSpreadsheetData(
          workbook,
          mappedApps,
          columns,
          queryParams,
          true,
          {
            id: preference.id,
            name: preference.text,
          },
        );
      }
    }
  }

  /**
   *
   * @param workbook the spreadsheet we'll be adding data too
   * @param applications the full list of partial applications
   * @param csvHeaders the headers and renderers of the export
   * @param queryParams the incoming param args
   * @param forLottery whether we are getting the lottery results or not
   * @param preference if present, then builds the preference specific spreadsheet page
   * @returns void but writes the output to a file
   */
  async generateSpreadsheetData(
    workbook: Excel.stream.xlsx.WorkbookWriter,
    applications: Application[],
    csvHeaders: CsvHeader[],
    queryParams: ApplicationCsvQueryParams,
    forLottery = false,
    preference?: IdDTO,
  ): Promise<void> {
    // create a spreadsheet. If the preference is passed in use that as a title otherwise 'raw'
    const spreadsheet = this.createNewWorksheet(
      workbook,
      forLottery,
      preference,
    );
    spreadsheet.columns = this.buildExportColumns(csvHeaders, preference);

    const filteredApplications = preference
      ? applications.filter((app) =>
          app.preferences.some(
            (pref) =>
              (pref.multiselectQuestionId === preference.id ||
                pref.key === preference.name) &&
              pref.claimed,
          ),
        )
      : applications;

    for (
      let i = 0;
      i < filteredApplications.length;
      i += NUMBER_TO_PAGINATE_BY
    ) {
      const slicedApplications = filteredApplications.slice(
        i,
        i + NUMBER_TO_PAGINATE_BY,
      );

      // grab applications NUMBER_TO_PAGINATE_BY at a time
      let paginatedApplications = await this.prisma.applications.findMany({
        include: {
          ...view.csv,
          demographics: queryParams.includeDemographics
            ? {
                select: {
                  id: true,
                  createdAt: true,
                  updatedAt: true,
                  ethnicity: true,
                  gender: true,
                  sexualOrientation: true,
                  howDidYouHear: true,
                  race: true,
                },
              }
            : false,
          applicationLotteryPositions: forLottery
            ? {
                select: {
                  ordinal: true,
                },
                where: {
                  multiselectQuestionId: preference ? preference.id : null,
                },
              }
            : false,
        },
        where: {
          listingId: queryParams.id,
          deletedAt: null,
          markedAsDuplicate: forLottery ? false : undefined,
          id: {
            in: slicedApplications.map((app) => app.id),
          },
        },
      });

      if (forLottery) {
        // We need to filter out applications that have "claimed" preference but they really chose to opt out
        // And then it is sorted based on the ordinal value
        paginatedApplications = paginatedApplications
          .filter((app) => app.applicationLotteryPositions?.length)
          .sort(
            (a, b) =>
              a.applicationLotteryPositions[0].ordinal -
              b.applicationLotteryPositions[0].ordinal,
          );
      }

      paginatedApplications.forEach((app) => {
        const rowData = {};
        let preferences: ApplicationMultiselectQuestion[];
        let programs: ApplicationMultiselectQuestion[];

        if (preference) {
          rowData['Raw Lottery Rank'] = slicedApplications.find(
            (slicedApp) => slicedApp.id === app.id,
          ).applicationLotteryPositions[0].ordinal;
        }

        csvHeaders.forEach((header) => {
          let multiselectQuestionValue = false;
          let parsePreference = false;
          let parseProgram = false;
          let value = header.path.split('.').reduce((acc, curr) => {
            // return preference/program as value for the format function to accept
            if (multiselectQuestionValue) {
              return acc;
            }

            if (parsePreference) {
              // curr should equal the preference id we're pulling from
              if (!preferences) {
                preferences =
                  (app.preferences as unknown as ApplicationMultiselectQuestion[]) ||
                  [];
              }
              parsePreference = false;
              // there aren't typically many preferences, but if there, then a object map should be created and used
              const preference = preferences.find(
                (preference) => preference.key === curr,
              );
              multiselectQuestionValue = true;
              return preference;
            } else if (parseProgram) {
              // curr should equal the preference id we're pulling from
              if (!programs) {
                programs =
                  (app.programs as unknown as ApplicationMultiselectQuestion[]) ||
                  [];
              }
              parsePreference = false;
              // there aren't typically many programs, but if there, then a object map should be created and used
              const program = programs.find(
                (preference) => preference.key === curr,
              );
              multiselectQuestionValue = true;
              return program;
            }

            // sets parsePreference to true, for the next iteration
            if (curr === 'preferences') {
              parsePreference = true;
            } else if (curr === 'programs') {
              parseProgram = true;
            }

            if (acc === null || acc === undefined) {
              return '';
            }

            // handles working with arrays, e.g. householdMember.0.firstName
            if (!isNaN(Number(curr))) {
              const index = Number(curr);
              return acc[index];
            }

            return acc[curr];
          }, app);
          value = value === undefined ? '' : value === null ? '' : value;
          if (header.format) {
            value = header.format(value);
          }

          rowData[`${header.path}`] = value ? value.toString() : '';
        });
        spreadsheet.addRow(rowData).commit();
      });
    }
    spreadsheet.commit();
  }

  /**
   *
   * @param workbook the work book we are creating a new sheet inside of
   * @param forLottery if this is being created for a lottery export or not
   * @param preference if this is for a lottery preference sheet
   * @returns a new worksheet
   */
  createNewWorksheet(
    workbook: Excel.stream.xlsx.WorkbookWriter,
    forLottery: boolean,
    preference?: IdDTO,
  ): Excel.Worksheet {
    if (forLottery) {
      return workbook.addWorksheet(
        preference
          ? preference.name.replace(/[\*\?\:\\\/]/g, '-')
          : 'Raw Lottery Rank',
      );
    }
    return workbook.addWorksheet('Application Export');
  }

  /**
   *
   * @param csvHeaders the export headers
   * @param preference optional, this is to indicate whether this is for a preference sheet or not
   * @returns an array of excel column data
   */
  buildExportColumns(
    csvHeaders: CsvHeader[],
    preference?: IdDTO,
  ): Partial<Column>[] {
    const res: Partial<Column>[] = csvHeaders.map((header) => ({
      key: header.path,
      header: header.label,
    }));

    if (preference) {
      const indx = res.findIndex(
        (header) => header.header === 'Raw Lottery Rank',
      );

      res[indx].header = `${preference.name} Rank`;

      res.splice(indx, 0, {
        key: 'Raw Lottery Rank',
        header: 'Raw Lottery Rank',
      });
    }
    return res;
  }

  /**
   *
   * @param questions a collection of questions which can include more than preferences, the rest will be filtered out
   * @param listingId the id of the listing
   * @returns listing preferences sorted in ordinal order
   */
  async sortPreferencesByOrdinal(
    questions: MultiselectQuestion[],
    listingId: string,
  ) {
    const preferences = questions.filter(
      (question) =>
        question.applicationSection ===
        MultiselectQuestionsApplicationSectionEnum.preferences,
    );

    // pull in the preference questions by ordinal
    const listingPreferencesByOrdinal =
      await this.prisma.listingMultiselectQuestions.findMany({
        where: {
          listingId: listingId,
          multiselectQuestionId: {
            in: [...preferences.map((preference) => preference.id)],
          },
        },
        orderBy: {
          ordinal: 'asc',
        },
      });

    // get a sorted list of preferences via listing preference ordinal
    return listingPreferencesByOrdinal.map((item) =>
      preferences.find(
        (preference) => preference.id === item.multiselectQuestionId,
      ),
    );
  }

  // shared functions
  /**
   *
   * @param user the user requesting the export
   * @param listingId the listing id the applications will be tied to
   */
  async authorizeExport(user, listingId): Promise<void> {
    /**
     * Checking authorization for each application is very expensive.
     * By making listingId required, we can check if the user has update permissions for the listing, since right now if a user has that
     * they also can run the export for that listing
     */
    const jurisdictionId =
      await this.listingService.getJurisdictionIdByListingId(listingId);

    await this.permissionService.canOrThrow(
      user,
      'listing',
      permissionActions.update,
      {
        id: listingId,
        jurisdictionId,
      },
    );
  }
}

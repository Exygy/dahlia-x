/* eslint-disable import/no-named-as-default */
import React from "react"
import { setupServer } from "msw/lib/node"
import { fireEvent, mockNextRouter, render, within } from "../../../testUtils"
import { ListingContext } from "../../../../src/components/listings/ListingContext"
import { jurisdiction, listing, user } from "@bloom-housing/shared-helpers/__tests__/testHelpers"
import DetailListingData from "../../../../src/components/listings/PaperListingDetails/sections/DetailListingData"
import DetailListingIntro from "../../../../src/components/listings/PaperListingDetails/sections/DetailListingIntro"
import DetailBuildingDetails from "../../../../src/components/listings/PaperListingDetails/sections/DetailBuildingDetails"
import DetailCommunityType from "../../../../src/components/listings/PaperListingDetails/sections/DetailCommunityType"
import DetailUnits from "../../../../src/components/listings/PaperListingDetails/sections/DetailUnits"
import DetailPreferences from "../../../../src/components/listings/PaperListingDetails/sections/DetailPreferences"
import {
  ApplicationAddressTypeEnum,
  ApplicationMethodsTypeEnum,
  LanguagesEnum,
  ListingEventsTypeEnum,
  ListingsStatusEnum,
  MultiselectQuestionsApplicationSectionEnum,
  ReviewOrderTypeEnum,
} from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import DetailAdditionalFees from "../../../../src/components/listings/PaperListingDetails/sections/DetailAdditionalFees"
import DetailBuildingFeatures from "../../../../src/components/listings/PaperListingDetails/sections/DetailBuildingFeatures"
import { AuthContext } from "@bloom-housing/shared-helpers"
import { rest } from "msw"
import DetailAdditionalEligibility from "../../../../src/components/listings/PaperListingDetails/sections/DetailAdditionalEligibility"
import DetailAdditionalDetails from "../../../../src/components/listings/PaperListingDetails/sections/DetailAdditionalDetails"
import DetailRankingsAndResults from "../../../../src/components/listings/PaperListingDetails/sections/DetailRankingsAndResults"
import DetailLeasingAgent from "../../../../src/components/listings/PaperListingDetails/sections/DetailLeasingAgent"
import DetailApplicationTypes from "../../../../src/components/listings/PaperListingDetails/sections/DetailApplicationTypes"
import DetailApplicationAddress from "../../../../src/components/listings/PaperListingDetails/sections/DetailApplicationAddress"
import DetailApplicationDates from "../../../../src/components/listings/PaperListingDetails/sections/DetailApplicationDates"
import DetailListingPhotos from "../../../../src/components/listings/PaperListingDetails/sections/DetailListingPhotos"
import DetailListingNotes from "../../../../src/components/listings/PaperListingDetails/sections/DetailNotes"
import ListingDetail, { getServerSideProps } from "../../../../src/pages/listings/[id]"
import DetailPrograms from "../../../../src/components/listings/PaperListingDetails/sections/DetailPrograms"
import DetailListingVerification from "../../../../src/components/listings/PaperListingDetails/sections/DetailListingVerification"

const server = setupServer()

window.scrollTo = jest.fn()

const MOCK_CONTEXT = {
  params: {
    id: "Uvbk5qurpB2WI9V6WnNdH",
  },
  req: {
    headers: {
      "x-forwarded-for": "127.0.0.1",
    },
    socket: {
      remoteAddress: "127.0.0.1",
    },
  },
}

beforeAll(() => {
  mockNextRouter()
  server.listen()
})

beforeEach(() => {
  server.use(rest.get("http://localhost/api/adapter/user", (_req, res, ctx) => res(ctx.json(user))))
})

afterEach(() => {
  server.resetHandlers()
  window.sessionStorage.clear()
})

afterAll(() => {
  server.close()
})

describe("listing data", () => {
  describe("should display all listing data", () => {
    it("should display Listing Data section", () => {
      const { getByText } = render(
        <ListingContext.Provider
          value={{
            ...listing,
            createdAt: new Date("February 3, 2025, 10:13"),
          }}
        >
          <DetailListingData />
        </ListingContext.Provider>
      )

      expect(getByText("Listing Data")).toBeInTheDocument()
      expect(getByText("Listing ID")).toBeInTheDocument()
      expect(getByText("Uvbk5qurpB2WI9V6WnNdH")).toBeInTheDocument()
      expect(getByText("Date Created")).toBeInTheDocument()
      expect(getByText("02/03/2025 at 10:13 AM")).toBeInTheDocument()
    })

    describe("should display Listing Notes section", () => {
      const STATUS_OPTIONS = (Object.values(ListingsStatusEnum) as string[]).filter(
        (item) => item !== ListingsStatusEnum.changesRequested
      )

      it.each(STATUS_OPTIONS)("should hide section for %s status", (status) => {
        const { queryByText } = render(
          <ListingContext.Provider
            value={{
              ...listing,
              status: status as ListingsStatusEnum,
            }}
          >
            <DetailListingNotes />
          </ListingContext.Provider>
        )

        expect(queryByText("Listing Notes")).not.toBeInTheDocument()
        expect(queryByText("Change Request Summary")).not.toBeInTheDocument()
        expect(queryByText("Test changes")).not.toBeInTheDocument()
        expect(queryByText("Request Date")).not.toBeInTheDocument()
        expect(queryByText("01/10/2025")).not.toBeInTheDocument()
        expect(queryByText("Requested By")).not.toBeInTheDocument()
        expect(queryByText("John Test")).not.toBeInTheDocument()
      })

      it("should show Listing Notes section data - no user defined", () => {
        const { getByText, queryByText } = render(
          <ListingContext.Provider
            value={{
              ...listing,
              status: ListingsStatusEnum.changesRequested,
              requestedChanges: "Test changes",
              requestedChangesDate: new Date(2025, 0, 10, 13, 0),
              requestedChangesUser: undefined,
            }}
          >
            <DetailListingNotes />
          </ListingContext.Provider>
        )

        expect(getByText("Listing Notes")).toBeInTheDocument()
        expect(getByText("Change Request Summary")).toBeInTheDocument()
        expect(getByText("Test changes")).toBeInTheDocument()
        expect(getByText("Request Date")).toBeInTheDocument()
        expect(getByText("01/10/2025")).toBeInTheDocument()
        expect(queryByText("Requested By")).not.toBeInTheDocument()
        expect(queryByText("John Test")).not.toBeInTheDocument()
      })

      it("should show Listing Notes section data - with user defined", () => {
        const { getByText } = render(
          <ListingContext.Provider
            value={{
              ...listing,
              status: ListingsStatusEnum.changesRequested,
              requestedChanges: "Test changes",
              requestedChangesDate: new Date(2025, 0, 10, 13, 0),
              requestedChangesUser: {
                id: "user_id",
                name: "John Test",
              },
            }}
          >
            <DetailListingNotes />
          </ListingContext.Provider>
        )

        expect(getByText("Listing Notes")).toBeInTheDocument()
        expect(getByText("Change Request Summary")).toBeInTheDocument()
        expect(getByText("Test changes")).toBeInTheDocument()
        expect(getByText("Request Date")).toBeInTheDocument()
        expect(getByText("01/10/2025")).toBeInTheDocument()
        expect(getByText("Requested By")).toBeInTheDocument()
        expect(getByText("John Test")).toBeInTheDocument()
      })
    })

    it("should display Listing Intro section", () => {
      const { getByText } = render(
        <ListingContext.Provider value={listing}>
          <DetailListingIntro />
        </ListingContext.Provider>
      )

      expect(getByText("Listing Intro")).toBeInTheDocument()
      expect(getByText("Listing Name")).toBeInTheDocument()
      expect(getByText("Archer Studios")).toBeInTheDocument()
      expect(getByText("Jurisdiction")).toBeInTheDocument()
      expect(getByText("San Jose")).toBeInTheDocument()
      expect(getByText("Housing Developer")).toBeInTheDocument()
      expect(getByText("Charities Housing")).toBeInTheDocument()
    })

    describe("should display Lisiting Photo section", () => {
      it("should display section with missing data", () => {
        const { getByText, queryByText, queryByRole } = render(
          <ListingContext.Provider
            value={{
              ...listing,
              listingImages: [],
            }}
          >
            <DetailListingPhotos />
          </ListingContext.Provider>
        )

        expect(getByText("Listing Photo")).toBeInTheDocument()
        expect(getByText("None")).toBeInTheDocument()
        expect(queryByText("Preview")).not.toBeInTheDocument()
        expect(queryByText("Primary")).not.toBeInTheDocument()
        expect(queryByText("Primary photo")).not.toBeInTheDocument()
        expect(queryByRole("img")).not.toBeInTheDocument()
      })

      it("should display Lisiting Photo section data", () => {
        const { getByText, getAllByRole } = render(
          <ListingContext.Provider
            value={{
              ...listing,
              listingImages: [
                {
                  assets: {
                    id: "asset_id_1",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    fileId: "asset_file_id",
                    label: "Asset #1",
                  },
                },
                {
                  assets: {
                    id: "asset_id_2",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    fileId: "asset_file_id",
                    label: "Asset #2",
                  },
                },
              ],
            }}
          >
            <DetailListingPhotos />
          </ListingContext.Provider>
        )

        expect(getByText("Listing Photo", { selector: "h2" })).toBeInTheDocument()
        expect(getByText("Preview")).toBeInTheDocument()
        expect(getByText("Primary")).toBeInTheDocument()
        expect(getByText("Primary photo")).toBeInTheDocument()
        const listingImages = getAllByRole("img")
        expect(listingImages).toHaveLength(2)
        listingImages.forEach((imageElement) => {
          expect(imageElement).toHaveAttribute("src", "asset_file_id")
          expect(imageElement).toHaveAttribute("alt", "Listing Photo")
        })
      })
    })

    it("should display Building Details section", () => {
      const { getByText } = render(
        <ListingContext.Provider value={listing}>
          <DetailBuildingDetails />
        </ListingContext.Provider>
      )

      expect(getByText("Building Details")).toBeInTheDocument()
      expect(getByText("Building Address")).toBeInTheDocument()
      expect(getByText("Street Address")).toBeInTheDocument()
      expect(getByText("98 Archer Street")).toBeInTheDocument()
      expect(getByText("City")).toBeInTheDocument()
      expect(getByText("San Jose")).toBeInTheDocument()
      expect(getByText("Longitude")).toBeInTheDocument()
      expect(getByText("-121.91071")).toBeInTheDocument()
      expect(getByText("State")).toBeInTheDocument()
      expect(getByText("CA")).toBeInTheDocument()
      expect(getByText("Latitude")).toBeInTheDocument()
      expect(getByText("37.36537")).toBeInTheDocument()
      expect(getByText("Zip Code")).toBeInTheDocument()
      expect(getByText("95112")).toBeInTheDocument()
      expect(getByText("Neighborhood")).toBeInTheDocument()
      expect(getByText("Rosemary Gardens Park")).toBeInTheDocument()
      expect(getByText("Year Built")).toBeInTheDocument()
      expect(getByText("2012")).toBeInTheDocument()
    })

    describe("should display Community Type section", () => {
      it("should display all section data - without disclaimer", () => {
        const { getByText } = render(
          <ListingContext.Provider
            value={{
              ...listing,
              reservedCommunityTypes: {
                id: "farm-community",
                name: "farmworkerHousing",
              },
              reservedCommunityDescription: "Test community description",
            }}
          >
            <DetailCommunityType />
          </ListingContext.Provider>
        )

        expect(getByText("Community Type")).toBeInTheDocument()
        expect(getByText("Reserved Community Type")).toBeInTheDocument()
        expect(getByText("Farmworker Housing")).toBeInTheDocument()
        expect(getByText("Reserved Community Description")).toBeInTheDocument()
        expect(getByText("Test community description")).toBeInTheDocument()
        expect(
          getByText(
            "Do you want to include a community type disclaimer as the first page of the application?"
          )
        ).toBeInTheDocument()
        expect(getByText("No")).toBeInTheDocument()
      })

      it("should display all section data - with disclaimer", () => {
        const { getByText } = render(
          <ListingContext.Provider
            value={{
              ...listing,
              reservedCommunityTypes: {
                id: "farm-community",
                name: "farmworkerHousing",
              },
              reservedCommunityDescription: "Test community description",
              includeCommunityDisclaimer: true,
              communityDisclaimerTitle: "Test Disclaimer Title",
              communityDisclaimerDescription: "Test Disclaimer Description",
            }}
          >
            <DetailCommunityType />
          </ListingContext.Provider>
        )

        expect(getByText("Community Type")).toBeInTheDocument()
        expect(getByText("Reserved Community Type")).toBeInTheDocument()
        expect(getByText("Farmworker Housing")).toBeInTheDocument()
        expect(getByText("Reserved Community Description")).toBeInTheDocument()
        expect(getByText("Test community description")).toBeInTheDocument()
        expect(
          getByText(
            "Do you want to include a community type disclaimer as the first page of the application?"
          )
        ).toBeInTheDocument()
        expect(getByText("Yes")).toBeInTheDocument()
        expect(getByText("Test Disclaimer Title")).toBeInTheDocument()
        expect(getByText("Test Disclaimer Description")).toBeInTheDocument()
      })

      const COMMUNITY_TYPES = [
        {
          dtoField: "developmentalDisability",
          typeString: "Developmental Disability",
        },
        {
          dtoField: "farmworkerHousing",
          typeString: "Farmworker Housing",
        },
        {
          dtoField: "housingVoucher",
          typeString: "HCV/Section 8 Voucher",
        },
        {
          dtoField: "senior",
          typeString: "Seniors",
        },
        {
          dtoField: "senior55",
          typeString: "Seniors 55+",
        },
        {
          dtoField: "senior62",
          typeString: "Seniors 62+",
        },
        {
          dtoField: "specialNeeds",
          typeString: "Special Needs",
        },
        {
          dtoField: "veteran",
          typeString: "Veteran",
        },
        {
          dtoField: "schoolEmployee",
          typeString: "School Employee",
        },
      ].map((data) =>
        Object.assign(data, {
          toString: function () {
            return this.typeString
          },
        })
      )

      it.each(COMMUNITY_TYPES)(`Should display %s type`, (item) => {
        const { typeString, dtoField } = item
        const { getByText } = render(
          <ListingContext.Provider
            value={{
              ...listing,
              reservedCommunityTypes: {
                id: `${dtoField}Id`,
                name: dtoField,
              },
            }}
          >
            <DetailCommunityType />
          </ListingContext.Provider>
        )

        expect(getByText(typeString))
      })
    })

    it("should display missing Listing Units section", () => {
      const { getByText, queryByText } = render(
        <ListingContext.Provider
          value={{
            ...listing,
            section8Acceptance: false,
            units: [],
          }}
        >
          <DetailUnits setUnitDrawer={() => jest.fn()} />
        </ListingContext.Provider>
      )

      expect(getByText("Do you want to show unit types or individual units?")).toBeInTheDocument()
      expect(getByText("Individual Units")).toBeInTheDocument()
      expect(getByText("What is the listing availability?")).toBeInTheDocument()
      expect(getByText("Available Units")).toBeInTheDocument()
      expect(getByText("None")).toBeInTheDocument()

      expect(queryByText("Unit #")).not.toBeInTheDocument()
      expect(queryByText("Unit Type")).not.toBeInTheDocument()
      expect(queryByText("AMI")).not.toBeInTheDocument()
      expect(queryByText("Rent")).not.toBeInTheDocument()
      expect(queryByText("SQ FT")).not.toBeInTheDocument()
      expect(queryByText("ADA")).not.toBeInTheDocument()
      expect(queryByText("Do you accept Section 8 Housing Choice Vouchers")).not.toBeInTheDocument()
      expect(queryByText("No")).not.toBeInTheDocument()
    })

    it("should display Listing Units section", () => {
      const { getByText, getAllByText } = render(
        <AuthContext.Provider
          value={{
            profile: { ...user, jurisdictions: [], listings: [] },
            doJurisdictionsHaveFeatureFlagOn: () => true,
          }}
        >
          <ListingContext.Provider
            value={{
              ...listing,
              units: listing.units.map((entry, idx) => ({
                ...entry,
                number: `#${idx + 1}`,
                unitAccessibilityPriorityTypes: {
                  id: `ada_${idx}`,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  name: `Test ADA_${idx}`,
                },
              })),
              section8Acceptance: true,
            }}
          >
            <DetailUnits setUnitDrawer={() => jest.fn()} />
          </ListingContext.Provider>
        </AuthContext.Provider>
      )

      expect(getByText("Do you want to show unit types or individual units?")).toBeInTheDocument()
      expect(getByText("Individual Units")).toBeInTheDocument()
      expect(getByText("What is the listing availability?")).toBeInTheDocument()
      expect(getByText("Available Units")).toBeInTheDocument()

      expect(getByText("Unit #")).toBeInTheDocument()
      expect(getByText("Unit Type")).toBeInTheDocument()
      expect(getByText("AMI")).toBeInTheDocument()
      expect(getByText("Rent")).toBeInTheDocument()
      expect(getByText("SQ FT")).toBeInTheDocument()
      expect(getByText("ADA")).toBeInTheDocument()

      expect(getAllByText(/#[1-9]/i)).toHaveLength(6)
      expect(getAllByText("Studio")).toHaveLength(6)
      expect(getAllByText("45.0")).toHaveLength(6)
      expect(getAllByText("1104.0")).toHaveLength(6)
      expect(getAllByText("285")).toHaveLength(6)
      expect(getAllByText(/Test ADA_\d{1}/)).toHaveLength(6)
      expect(getAllByText("View")).toHaveLength(6)

      expect(getByText("Do you accept Section 8 Housing Choice Vouchers")).toBeInTheDocument()
      expect(getByText("Yes")).toBeInTheDocument()
    })

    it("should display missing Housing Preferences section", () => {
      const { getByText, queryByText } = render(
        <ListingContext.Provider value={{ ...listing, listingMultiselectQuestions: [] }}>
          <DetailPreferences />
        </ListingContext.Provider>
      )

      expect(getByText("Housing Preferences")).toBeInTheDocument()
      expect(getByText("Active Preferences")).toBeInTheDocument()
      expect(getByText("None")).toBeInTheDocument()
      expect(queryByText("Order")).not.toBeInTheDocument()
      expect(queryByText("Name")).not.toBeInTheDocument()
      expect(queryByText("Description")).not.toBeInTheDocument()
    })

    it("should display Housing Preferences section", () => {
      const { getByText, getAllByText } = render(
        <ListingContext.Provider
          value={{
            ...listing,
            listingMultiselectQuestions: [
              {
                multiselectQuestions: {
                  id: "preference_id_0",
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  jurisdictions: [],
                  text: "Test Name_1",
                  description: "Test Description_1",
                  applicationSection: MultiselectQuestionsApplicationSectionEnum.preferences,
                },
              },
              {
                multiselectQuestions: {
                  id: "preference_id_1",
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  jurisdictions: [],
                  text: "Test Name_2",
                  description: "Test Description_2",
                  applicationSection: MultiselectQuestionsApplicationSectionEnum.preferences,
                },
              },
            ],
          }}
        >
          <DetailPreferences />
        </ListingContext.Provider>
      )

      expect(getByText("Housing Preferences")).toBeInTheDocument()
      expect(getByText("Active Preferences")).toBeInTheDocument()
      expect(getByText("Order")).toBeInTheDocument()
      expect(getByText("1")).toBeInTheDocument()
      expect(getByText("2")).toBeInTheDocument()
      expect(getByText("Name")).toBeInTheDocument()
      expect(getAllByText(/Test Name_\d{1}/)).toHaveLength(2)
      expect(getByText("Description")).toBeInTheDocument()
      expect(getAllByText(/Test Description_\d{1}/)).toHaveLength(2)
    })

    it("should display Housing Programs section", () => {
      const { getByText, getAllByText } = render(
        <ListingContext.Provider
          value={{
            ...listing,
            listingMultiselectQuestions: [
              {
                multiselectQuestions: {
                  id: "program_id_0",
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  jurisdictions: [],
                  text: "Test Program Name_1",
                  description: "Test Program Description_1",
                  applicationSection: MultiselectQuestionsApplicationSectionEnum.programs,
                },
              },
              {
                multiselectQuestions: {
                  id: "program_id_1",
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  jurisdictions: [],
                  text: "Test Program Name_2",
                  description: "Test Program Description_2",
                  applicationSection: MultiselectQuestionsApplicationSectionEnum.programs,
                },
              },
            ],
          }}
        >
          <DetailPrograms />
        </ListingContext.Provider>
      )

      expect(getByText("Housing Programs")).toBeInTheDocument()
      expect(getByText("Active Programs")).toBeInTheDocument()
      expect(getByText("Order")).toBeInTheDocument()
      expect(getByText("1")).toBeInTheDocument()
      expect(getByText("2")).toBeInTheDocument()
      expect(getByText("Name")).toBeInTheDocument()
      expect(getAllByText(/Test Program Name_\d{1}/)).toHaveLength(2)
      expect(getByText("Description")).toBeInTheDocument()
      expect(getAllByText(/Test Program Description_\d{1}/)).toHaveLength(2)
    })

    it("should display Additional Fees section", () => {
      const { getByText } = render(
        <ListingContext.Provider
          value={{
            ...listing,
            depositMax: "1000",
            depositHelperText: "Test Deposit Helper Text",
            costsNotIncluded:
              "Resident responsible for PG&E, internet and phone. Owner pays for water, trash, and sewage.",
          }}
        >
          <DetailAdditionalFees />
        </ListingContext.Provider>
      )

      expect(getByText("Additional Fees")).toBeInTheDocument()
      expect(getByText("Application Fee")).toBeInTheDocument()
      expect(getByText("30.0")).toBeInTheDocument()
      expect(getByText("Deposit Max")).toBeInTheDocument()
      expect(getByText("1000")).toBeInTheDocument()
      expect(getByText("Deposit Helper Text")).toBeInTheDocument()
      expect(getByText("Test Deposit Helper Text")).toBeInTheDocument()
      expect(getByText("Deposit Min")).toBeInTheDocument()
      expect(getByText("1140.0")).toBeInTheDocument()
      expect(getByText("Costs Not Included")).toBeInTheDocument()
      expect(
        getByText(
          "Resident responsible for PG&E, internet and phone. Owner pays for water, trash, and sewage."
        )
      ).toBeInTheDocument()
    })

    describe("should display Building Features section", () => {
      it("should display data with no accessibility features", () => {
        const { getByText } = render(
          <ListingContext.Provider
            value={{
              ...listing,
              servicesOffered: "Professional Help",
            }}
          >
            <DetailBuildingFeatures />
          </ListingContext.Provider>
        )

        expect(getByText("Building Features")).toBeInTheDocument()
        expect(getByText("Property Amenities")).toBeInTheDocument()
        expect(
          getByText(
            "Community Room, Laundry Room, Assigned Parking, Bike Storage, Roof Top Garden, Part-time Resident Service Coordinator"
          )
        ).toBeInTheDocument()
        expect(getByText("Unit Amenities")).toBeInTheDocument()
        expect(getByText("Dishwasher")).toBeInTheDocument()
        expect(getByText("Additional Accessibility")).toBeInTheDocument()
        expect(
          getByText(
            "There is a total of 5 ADA units in the complex, all others are adaptable. Exterior Wheelchair ramp (front entry)"
          )
        ).toBeInTheDocument()
        expect(getByText("Smoking Policy")).toBeInTheDocument()
        expect(getByText("Non-smoking building")).toBeInTheDocument()
        expect(getByText("Pets Policy")).toBeInTheDocument()
        expect(
          getByText(
            "No pets allowed. Accommodation animals may be granted to persons with disabilities via a reasonable accommodation request."
          )
        ).toBeInTheDocument()
        expect(getByText("Services Offered")).toBeInTheDocument()
        expect(getByText("Professional Help")).toBeInTheDocument()
      })

      it("should display accessibility features", () => {
        document.cookie = "access-token-available=True"
        server.use(
          rest.get("http://localhost/api/adapter/user", (_req, res, ctx) => {
            return res(ctx.json(user))
          })
        )

        const { getByText } = render(
          <AuthContext.Provider
            value={{
              profile: {
                ...user,
                jurisdictions: [],
                listings: [],
              },
              doJurisdictionsHaveFeatureFlagOn: () => true,
            }}
          >
            <ListingContext.Provider
              value={{
                ...listing,
                listingFeatures: {
                  elevator: true,
                  wheelchairRamp: true,
                  serviceAnimalsAllowed: true,
                  accessibleParking: true,
                  parkingOnSite: true,
                  inUnitWasherDryer: true,
                  laundryInBuilding: true,
                  barrierFreeEntrance: true,
                  rollInShower: true,
                  grabBars: true,
                  heatingInUnit: true,
                  acInUnit: true,
                  hearing: true,
                  visual: true,
                  mobility: true,
                },
              }}
            >
              <DetailBuildingFeatures />
            </ListingContext.Provider>
          </AuthContext.Provider>
        )

        expect(getByText("Elevator")).toBeInTheDocument()
        expect(getByText("Wheelchair Ramp")).toBeInTheDocument()
        expect(getByText("Service Animals Allowed")).toBeInTheDocument()
        expect(getByText("Accessible Parking")).toBeInTheDocument()
        expect(getByText("Parking On Site")).toBeInTheDocument()
        expect(getByText("In Unit Washer Dryer")).toBeInTheDocument()
        expect(getByText("Laundry in Building")).toBeInTheDocument()
        expect(getByText("Barrier Free Entrance")).toBeInTheDocument()
        expect(getByText("Roll in Shower")).toBeInTheDocument()
        expect(getByText("Grab Bars")).toBeInTheDocument()
        expect(getByText("Heating in Unit")).toBeInTheDocument()
        expect(getByText("AC in Unit")).toBeInTheDocument()
        expect(getByText("Hearing")).toBeInTheDocument()
        expect(getByText("Visual")).toBeInTheDocument()
        expect(getByText("Mobility")).toBeInTheDocument()
      })
    })

    describe("should display Additional Eligibility Rules section", () => {
      it("should display data with selection criteria", () => {
        const { getByText, queryByText } = render(
          <ListingContext.Provider
            value={{
              ...listing,
            }}
          >
            <DetailAdditionalEligibility />
          </ListingContext.Provider>
        )

        expect(getByText("Additional Eligibility Rules")).toBeInTheDocument()
        expect(getByText("Credit History")).toBeInTheDocument()
        expect(
          // Look only for part of the text to verify that content rendered properly
          getByText(
            /Applications will be rated on a score system for housing. An applicant's score may be impacted by negative tenant peformance information provided to the credit reporting agency./
          )
        ).toBeInTheDocument()
        expect(getByText("Rental History")).toBeInTheDocument()
        expect(
          // Look only for part of the text to verify that content rendered properly
          getByText(/Two years of rental history will be verified with all applicable landlords./)
        ).toBeInTheDocument()
        expect(getByText("Criminal Background")).toBeInTheDocument()
        expect(
          // Look only for part of the text to verify that content rendered properly
          getByText(/A criminal background investigation will be obtained on each applicant./)
        ).toBeInTheDocument()
        expect(getByText("Rental Assistance")).toBeInTheDocument()
        expect(getByText("Custom rental assistance")).toBeInTheDocument()
        expect(getByText("Building Criteria Selection")).toBeInTheDocument()
        expect(getByText("URL")).toBeInTheDocument()
        expect(
          getByText("Tenant Selection Criteria will be available to all applicants upon request.")
        ).toBeInTheDocument()
        expect(queryByText("Preview")).not.toBeInTheDocument()
        expect(queryByText("File Name")).not.toBeInTheDocument()
      })

      it("should display selection criteria file", async () => {
        const { getByText, findByRole } = render(
          <ListingContext.Provider
            value={{
              ...listing,
              listingsBuildingSelectionCriteriaFile: {
                id: "test_file_id",
                createdAt: new Date(),
                updatedAt: new Date(),
                fileId: "example_file",
                label: "Test label",
              },
            }}
          >
            <DetailAdditionalEligibility />
          </ListingContext.Provider>
        )

        expect(getByText("Preview")).toBeInTheDocument()
        expect(getByText("File Name")).toBeInTheDocument()
        expect(getByText("example_file.pdf")).toBeInTheDocument()
        expect(getByText("Preview")).toBeInTheDocument()

        const previewImage = await findByRole("img")
        expect(previewImage).toBeInTheDocument()
        expect(previewImage).toHaveAttribute(
          "src",
          "https://res.cloudinary.com/exygy/image/upload/w_400,c_limit,q_65/example_file.jpg"
        )
        expect(previewImage).toHaveAttribute("alt", "PDF preview")
      })
    })

    it("should display Additional Details section", () => {
      const { getByText } = render(
        <ListingContext.Provider
          value={{
            ...listing,
          }}
        >
          <DetailAdditionalDetails />
        </ListingContext.Provider>
      )

      expect(getByText("Required Documents")).toBeInTheDocument()
      expect(getByText("Completed application and government issued IDs")).toBeInTheDocument()
      expect(getByText("Important Program Rules")).toBeInTheDocument()
      expect(
        getByText(
          "Applicants must adhere to minimum & maximum income limits. Tenant Selection Criteria applies."
        )
      ).toBeInTheDocument()
      expect(getByText("Special Notes")).toBeInTheDocument()
      expect(getByText("Special notes description")).toBeInTheDocument()
    })

    describe("should display Rankings & Results section", () => {
      it("should display data for waitlist review order typy without lottery event", () => {
        const { getByText, queryByText } = render(
          <ListingContext.Provider
            value={{
              ...listing,
              reviewOrderType: ReviewOrderTypeEnum.waitlist,
              listingEvents: [],
              isWaitlistOpen: true,
              waitlistOpenSpots: 4,
            }}
          >
            <DetailRankingsAndResults />
          </ListingContext.Provider>
        )

        expect(getByText("Rankings & Results")).toBeInTheDocument()
        expect(getByText("Do you want to show a waitlist size?")).toBeInTheDocument()
        expect(getByText("Yes")).toBeInTheDocument()
        expect(getByText("Number of Openings")).toBeInTheDocument()
        expect(getByText("Tell the applicant what to expect from the process")).toBeInTheDocument()
        expect(
          getByText(
            "Applicant will be contacted. All info will be verified. Be prepared if chosen."
          )
        ).toBeInTheDocument()

        expect(
          queryByText("How is the application review order determined?")
        ).not.toBeInTheDocument()
        expect(queryByText("Lottery")).not.toBeInTheDocument()
        expect(queryByText("First come first serve")).not.toBeInTheDocument()
        expect(
          queryByText("Will the lottery be run in the partner portal?")
        ).not.toBeInTheDocument()
        expect(queryByText("When will the lottery be run?")).not.toBeInTheDocument()
        expect(queryByText("Lottery Start Time")).not.toBeInTheDocument()
        expect(queryByText("Lottery End Time")).not.toBeInTheDocument()
        expect(queryByText("Lottery Date Notes")).not.toBeInTheDocument()
      })

      it("should display data for first come first serve review order typy without lottery event", () => {
        const { getByText, queryByText } = render(
          <ListingContext.Provider
            value={{
              ...listing,
              reviewOrderType: ReviewOrderTypeEnum.firstComeFirstServe,
              listingEvents: [],
              isWaitlistOpen: true,
              waitlistOpenSpots: 4,
            }}
          >
            <DetailRankingsAndResults />
          </ListingContext.Provider>
        )

        expect(getByText("Rankings & Results")).toBeInTheDocument()
        expect(getByText("How is the application review order determined?")).toBeInTheDocument()
        expect(getByText("First come first serve")).toBeInTheDocument()
        expect(getByText("Tell the applicant what to expect from the process")).toBeInTheDocument()
        expect(
          getByText(
            "Applicant will be contacted. All info will be verified. Be prepared if chosen."
          )
        ).toBeInTheDocument()

        expect(queryByText("Do you want to show a waitlist size?")).not.toBeInTheDocument()
        expect(queryByText("Yes")).not.toBeInTheDocument()
        expect(queryByText("Number of Openings")).not.toBeInTheDocument()
        expect(queryByText("Lottery")).not.toBeInTheDocument()
        expect(
          queryByText("Will the lottery be run in the partner portal?")
        ).not.toBeInTheDocument()
        expect(queryByText("When will the lottery be run?")).not.toBeInTheDocument()
        expect(queryByText("Lottery Start Time")).not.toBeInTheDocument()
        expect(queryByText("Lottery End Time")).not.toBeInTheDocument()
        expect(queryByText("Lottery Date Notes")).not.toBeInTheDocument()
      })

      it("should display data for lottery serve review order typy with lottery event", () => {
        process.env.showLottery = "true"
        const { getByText, queryByText } = render(
          <ListingContext.Provider
            value={{
              ...listing,
              reviewOrderType: ReviewOrderTypeEnum.lottery,
              listingEvents: [
                {
                  id: "event_id_1",
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  type: ListingEventsTypeEnum.publicLottery,
                  startDate: new Date(2024, 1, 18, 10, 30),
                  startTime: new Date(2024, 1, 18, 10, 30),
                  endTime: new Date(2024, 1, 18, 12, 15),
                  note: "Test lottery note",
                },
              ],
              isWaitlistOpen: true,
              waitlistOpenSpots: 4,
            }}
          >
            <DetailRankingsAndResults />
          </ListingContext.Provider>
        )

        expect(getByText("Rankings & Results")).toBeInTheDocument()
        expect(getByText("How is the application review order determined?")).toBeInTheDocument()
        expect(getByText("Lottery")).toBeInTheDocument()
        expect(getByText("Will the lottery be run in the partner portal?")).toBeInTheDocument()
        expect(getByText("No")).toBeInTheDocument()
        expect(getByText("When will the lottery be run?")).toBeInTheDocument()
        expect(getByText("02/18/2024")).toBeInTheDocument()
        expect(getByText("Lottery Start Time")).toBeInTheDocument()
        expect(getByText("10:30 AM")).toBeInTheDocument()
        expect(getByText("Lottery End Time")).toBeInTheDocument()
        expect(getByText("12:15 PM")).toBeInTheDocument()
        expect(getByText("Lottery Date Notes")).toBeInTheDocument()
        expect(getByText("Test lottery note")).toBeInTheDocument()
        expect(getByText("Tell the applicant what to expect from the process")).toBeInTheDocument()
        expect(
          getByText(
            "Applicant will be contacted. All info will be verified. Be prepared if chosen."
          )
        ).toBeInTheDocument()

        expect(queryByText("Do you want to show a waitlist size?")).not.toBeInTheDocument()
        expect(queryByText("Yes")).not.toBeInTheDocument()
        expect(queryByText("Number of Openings")).not.toBeInTheDocument()
        expect(queryByText("First come first serve")).not.toBeInTheDocument()
      })
    })

    it("should display Leasing Agent section", () => {
      const { getByText } = render(
        <ListingContext.Provider
          value={{
            ...listing,
            leasingAgentTitle: "Pro Agent",
            listingsLeasingAgentAddress: {
              ...listing.listingsLeasingAgentAddress,
              street2: "#12",
            },
          }}
        >
          <DetailLeasingAgent />
        </ListingContext.Provider>
      )

      expect(getByText("Leasing Agent")).toBeInTheDocument()
      expect(getByText("Leasing Agent Name")).toBeInTheDocument()
      expect(getByText("Marisela Baca")).toBeInTheDocument()
      expect(getByText("Email")).toBeInTheDocument()
      expect(getByText("mbaca@charitieshousing.org")).toBeInTheDocument()
      expect(getByText("Phone")).toBeInTheDocument()
      expect(getByText("(408) 217-8562")).toBeInTheDocument()
      expect(getByText("Leasing Agent Title")).toBeInTheDocument()
      expect(getByText("Pro Agent")).toBeInTheDocument()
      expect(getByText("Office Hours")).toBeInTheDocument()
      expect(getByText("Monday, Tuesday & Friday, 9:00AM - 5:00PM")).toBeInTheDocument()
      expect(getByText("Leasing Agent Address")).toBeInTheDocument()
      expect(getByText("Street Address or PO Box")).toBeInTheDocument()
      expect(getByText("98 Archer Street")).toBeInTheDocument()
      expect(getByText("Apt or Unit #")).toBeInTheDocument()
      expect(getByText("#12")).toBeInTheDocument()
      expect(getByText("City")).toBeInTheDocument()
      expect(getByText("San Jose")).toBeInTheDocument()
      expect(getByText("State")).toBeInTheDocument()
      expect(getByText("CA")).toBeInTheDocument()
      expect(getByText("Zip Code")).toBeInTheDocument()
      expect(getByText("95112")).toBeInTheDocument()
    })

    describe("should display Application Types section", () => {
      it("should display section with missing data", () => {
        const { getByText, getAllByText, queryByText } = render(
          <ListingContext.Provider
            value={{
              ...listing,
              commonDigitalApplication: undefined,
              applicationMethods: [],
            }}
          >
            <DetailApplicationTypes />
          </ListingContext.Provider>
        )

        expect(getByText("Application Types")).toBeInTheDocument()
        expect(getByText("Online Applications")).toBeInTheDocument()
        expect(getByText("Paper Applications")).toBeInTheDocument()
        expect(getByText("Referral")).toBeInTheDocument()
        expect(getAllByText("n/a")).toHaveLength(3)
        expect(queryByText("Common Digital Application")).not.toBeInTheDocument()
        expect(queryByText("Referral Contact Phone")).not.toBeInTheDocument()
        expect(queryByText("Referral Summary")).not.toBeInTheDocument()
        expect(queryByText("Custom Online Application URL")).not.toBeInTheDocument()
        expect(queryByText("File Name")).not.toBeInTheDocument()
        expect(queryByText("Language")).not.toBeInTheDocument()
      })

      it("should display section data - for internal application", () => {
        const { getByText, getAllByText, queryByText } = render(
          <ListingContext.Provider
            value={{
              ...listing,
              applicationMethods: [
                {
                  id: "method_id",
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  type: ApplicationMethodsTypeEnum.Internal,
                  externalReference: "Test Refference",
                },
              ],
              digitalApplication: true,
              paperApplication: true,
              referralOpportunity: true,
            }}
          >
            <DetailApplicationTypes />
          </ListingContext.Provider>
        )

        expect(getByText("Application Types")).toBeInTheDocument()
        expect(getByText("Online Applications")).toBeInTheDocument()
        expect(getByText("Common Digital Application")).toBeInTheDocument()
        expect(getByText("Paper Applications")).toBeInTheDocument()
        expect(getByText("Referral")).toBeInTheDocument()
        expect(getAllByText("Yes")).toHaveLength(4)
        expect(queryByText("Referral Contact Phone")).not.toBeInTheDocument()
        expect(queryByText("Referral Summary")).not.toBeInTheDocument()
        expect(queryByText("Custom Online Application URL")).not.toBeInTheDocument()
        expect(queryByText("File Name")).not.toBeInTheDocument()
        expect(queryByText("Language")).not.toBeInTheDocument()
      })

      it("should display section data - for external application", () => {
        const { getByText, getAllByText, queryByText } = render(
          <ListingContext.Provider
            value={{
              ...listing,
              applicationMethods: [
                {
                  id: "method_id",
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  type: ApplicationMethodsTypeEnum.ExternalLink,
                  externalReference: "Test Refference",
                },
              ],
              digitalApplication: false,
              paperApplication: false,
              referralOpportunity: false,
            }}
          >
            <DetailApplicationTypes />
          </ListingContext.Provider>
        )

        expect(getByText("Application Types")).toBeInTheDocument()
        expect(getByText("Online Applications")).toBeInTheDocument()
        expect(getByText("Common Digital Application")).toBeInTheDocument()
        expect(getByText("Paper Applications")).toBeInTheDocument()
        expect(getByText("Custom Online Application URL")).toBeInTheDocument()
        expect(getByText("Test Refference")).toBeInTheDocument()
        expect(getByText("Referral")).toBeInTheDocument()
        expect(getAllByText("No")).toHaveLength(4)
        expect(queryByText("Referral Contact Phone")).not.toBeInTheDocument()
        expect(queryByText("Referral Summary")).not.toBeInTheDocument()
        expect(queryByText("File Name")).not.toBeInTheDocument()
        expect(queryByText("Language")).not.toBeInTheDocument()
      })

      it("should display section data - for referral application", () => {
        const { getByText, getAllByText, queryByText } = render(
          <ListingContext.Provider
            value={{
              ...listing,
              applicationMethods: [
                {
                  id: "method_id",
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  type: ApplicationMethodsTypeEnum.Referral,
                  externalReference: "Test Refferal Summary",
                  phoneNumber: "(509) 786-4500",
                },
              ],
              digitalApplication: false,
              paperApplication: false,
              referralOpportunity: false,
            }}
          >
            <DetailApplicationTypes />
          </ListingContext.Provider>
        )

        expect(getByText("Application Types")).toBeInTheDocument()
        expect(getByText("Online Applications")).toBeInTheDocument()
        expect(getByText("Paper Applications")).toBeInTheDocument()
        expect(getByText("Referral")).toBeInTheDocument()
        expect(getAllByText("No")).toHaveLength(3)
        expect(getByText("Referral Contact Phone")).toBeInTheDocument()
        expect(getByText("(509) 786-4500")).toBeInTheDocument()
        expect(getByText("Referral Summary")).toBeInTheDocument()
        expect(getByText("Test Refferal Summary")).toBeInTheDocument()

        expect(queryByText("Common Digital Application")).not.toBeInTheDocument()
        expect(queryByText("Custom Online Application URL")).not.toBeInTheDocument()
        expect(queryByText("Test Refference")).not.toBeInTheDocument()
        expect(queryByText("File Name")).not.toBeInTheDocument()
        expect(queryByText("Language")).not.toBeInTheDocument()
      })

      it("should display section data - for paper application", () => {
        const { getByText, getAllByText, queryByText } = render(
          <ListingContext.Provider
            value={{
              ...listing,
              applicationMethods: [
                {
                  id: "method_id",
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  type: ApplicationMethodsTypeEnum.FileDownload,
                  externalReference: "Test Refferal Summary",
                  phoneNumber: "(509) 786-4500",
                  paperApplications: [
                    {
                      id: "application_id_1",
                      createdAt: new Date(),
                      updatedAt: new Date(),
                      language: LanguagesEnum.en,
                      assets: {
                        id: "asset_id",
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        fileId: "asset_1_file_id",
                        label: "Asset 1",
                      },
                    },
                    {
                      id: "application_id_2",
                      createdAt: new Date(),
                      updatedAt: new Date(),
                      language: LanguagesEnum.es,
                      assets: {
                        id: "asset_id",
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        fileId: "asset_2_file_id",
                        label: "Asset 2",
                      },
                    },
                  ],
                },
              ],
              digitalApplication: false,
              paperApplication: false,
              referralOpportunity: false,
            }}
          >
            <DetailApplicationTypes />
          </ListingContext.Provider>
        )

        expect(getByText("Application Types")).toBeInTheDocument()
        expect(getByText("Online Applications")).toBeInTheDocument()
        expect(getAllByText("Paper Applications")).toHaveLength(2)
        expect(getByText("Referral")).toBeInTheDocument()
        expect(getAllByText("No")).toHaveLength(3)
        expect(getByText("File Name")).toBeInTheDocument()
        expect(getByText("Language")).toBeInTheDocument()
        expect(getByText("English")).toBeInTheDocument()
        expect(getByText("Español")).toBeInTheDocument()
        expect(getAllByText(/asset_\d_file_id.pdf/)).toHaveLength(2)

        expect(queryByText("Referral Contact Phone")).not.toBeInTheDocument()
        expect(queryByText("Referral Summary")).not.toBeInTheDocument()
        expect(queryByText("Common Digital Application")).not.toBeInTheDocument()
        expect(queryByText("Custom Online Application URL")).not.toBeInTheDocument()
        expect(queryByText("Test Refference")).not.toBeInTheDocument()
      })
    })

    describe("should display Application Address section", () => {
      it("should display section with mising data", () => {
        const { getByText, getAllByText, queryByText } = render(
          <ListingContext.Provider
            value={{
              ...listing,
              listingsApplicationMailingAddress: undefined,
              applicationMailingAddressType: undefined,
              listingsApplicationPickUpAddress: undefined,
              applicationPickUpAddressType: undefined,
              applicationPickUpAddressOfficeHours: undefined,
              listingsApplicationDropOffAddress: undefined,
              applicationDropOffAddressType: undefined,
              applicationDropOffAddressOfficeHours: undefined,
              postmarkedApplicationsReceivedByDate: undefined,
              additionalApplicationSubmissionNotes: undefined,
            }}
          >
            <DetailApplicationAddress />
          </ListingContext.Provider>
        )

        expect(getByText("Application Address")).toBeInTheDocument()
        expect(getByText("Can applications be mailed in?")).toBeInTheDocument()
        expect(getByText("Can applications be picked up?")).toBeInTheDocument()
        expect(getByText("Can applications be dropped off?")).toBeInTheDocument()
        expect(getByText("Are postmarks considered?")).toBeInTheDocument()
        expect(getByText("Additional Application Submission Notes")).toBeInTheDocument()
        expect(getAllByText("No")).toHaveLength(4)
        expect(getAllByText("None")).toHaveLength(1)

        expect(queryByText("Where can applications be mailed in?")).not.toBeInTheDocument()
        expect(queryByText("Leasing Agent Address")).not.toBeInTheDocument()
        expect(queryByText("Mailing Address")).not.toBeInTheDocument()
        expect(queryByText("Where are applications picked up?")).not.toBeInTheDocument()
        expect(queryByText("Pickup Address")).not.toBeInTheDocument()
        expect(queryByText("Office Hours")).not.toBeInTheDocument()
        expect(queryByText("Where are applications dropped off?")).not.toBeInTheDocument()
        expect(queryByText("Drop Off Address")).not.toBeInTheDocument()
        expect(queryByText("Received by Date")).not.toBeInTheDocument()
        expect(queryByText("Received by Time")).not.toBeInTheDocument()
      })

      it("should display all the Application Address data", () => {
        const { getByText, getAllByText } = render(
          <ListingContext.Provider
            value={{
              ...listing,
              listingsApplicationMailingAddress: {
                id: "mailing_adress_id",
                createdAt: new Date(),
                updatedAt: new Date(),
                city: "Warrensville Heights",
                state: "Ohio",
                street: "1598 Peaceful Lane",
                zipCode: "44128",
              },
              applicationMailingAddressType: ApplicationAddressTypeEnum.leasingAgent,
              listingsApplicationPickUpAddress: {
                id: "mailing_adress_id",
                createdAt: new Date(),
                updatedAt: new Date(),
                city: "Doral",
                state: "Florida",
                street: "2560 Barnes Street",
                street2: "#13",
                zipCode: "33166",
              },
              applicationPickUpAddressType: ApplicationAddressTypeEnum.leasingAgent,
              listingsApplicationDropOffAddress: {
                id: "mailing_adress_id",
                createdAt: new Date(),
                updatedAt: new Date(),
                city: "Zurich",
                state: "Montana",
                street: "3897 Benson Street",
                street2: "#29",
                zipCode: "59547",
              },
              applicationPickUpAddressOfficeHours: "9AM - 5PM",
              applicationDropOffAddressType: ApplicationAddressTypeEnum.leasingAgent,
              applicationDropOffAddressOfficeHours: "8AM - 4PM",
              postmarkedApplicationsReceivedByDate: new Date(2025, 2, 14, 8, 15),
              additionalApplicationSubmissionNotes: "Test Submission note",
            }}
          >
            <DetailApplicationAddress />
          </ListingContext.Provider>
        )

        expect(getByText("Application Address")).toBeInTheDocument()
        expect(getByText("Can applications be mailed in?")).toBeInTheDocument()
        expect(getByText("Where can applications be mailed in?")).toBeInTheDocument()
        expect(getByText("Mailing Address")).toBeInTheDocument()
        expect(getByText("Can applications be picked up?")).toBeInTheDocument()
        expect(getByText("Where are applications picked up?")).toBeInTheDocument()
        expect(getByText("Pickup Address")).toBeInTheDocument()
        expect(getByText("Can applications be dropped off?")).toBeInTheDocument()
        expect(getByText("Where are applications dropped off?")).toBeInTheDocument()
        expect(getByText("Drop Off Address")).toBeInTheDocument()
        expect(getByText("Are postmarks considered?")).toBeInTheDocument()
        expect(getByText("Received by Date")).toBeInTheDocument()
        expect(getByText("03/14/2025")).toBeInTheDocument()
        expect(getByText("Received by Time")).toBeInTheDocument()
        expect(getByText("08:15 AM")).toBeInTheDocument()
        expect(getByText("Additional Application Submission Notes")).toBeInTheDocument()
        expect(getByText("Test Submission note")).toBeInTheDocument()
        expect(getAllByText("Street Address or PO Box")).toHaveLength(3)
        expect(getAllByText("Apt or Unit #")).toHaveLength(3)
        expect(getAllByText("City")).toHaveLength(3)
        expect(getAllByText("State")).toHaveLength(3)
        expect(getAllByText("Zip Code")).toHaveLength(3)
        expect(getAllByText("Office Hours")).toHaveLength(2)
        expect(getAllByText("Yes")).toHaveLength(4)
        expect(getAllByText("Leasing Agent Address")).toHaveLength(3)
        expect(getByText("1598 Peaceful Lane")).toBeInTheDocument()
        expect(getByText("None")).toBeInTheDocument()
        expect(getByText("Warrensville Heights")).toBeInTheDocument()
        expect(getByText("Ohio")).toBeInTheDocument()
        expect(getByText("44128")).toBeInTheDocument()
        expect(getByText("2560 Barnes Street")).toBeInTheDocument()
        expect(getByText("#13")).toBeInTheDocument()
        expect(getByText("Doral")).toBeInTheDocument()
        expect(getByText("Florida")).toBeInTheDocument()
        expect(getByText("33166")).toBeInTheDocument()
        expect(getByText("3897 Benson Street")).toBeInTheDocument()
        expect(getByText("#29")).toBeInTheDocument()
        expect(getByText("Zurich")).toBeInTheDocument()
        expect(getByText("Montana")).toBeInTheDocument()
        expect(getByText("59547")).toBeInTheDocument()
      })
    })

    describe("should display Application Dates section", () => {
      it("should display section with mising data", () => {
        const { getByText, getAllByText, queryByText } = render(
          <ListingContext.Provider
            value={{
              ...listing,
              applicationDueDate: undefined,
              listingEvents: [],
            }}
          >
            <DetailApplicationDates />
          </ListingContext.Provider>
        )

        expect(getByText("Application Dates")).toBeInTheDocument()
        expect(getByText("Application Due Date")).toBeInTheDocument()
        expect(getByText("Application Due Time")).toBeInTheDocument()
        expect(getAllByText("None")).toHaveLength(2)
        expect(queryByText("Open Houses")).not.toBeInTheDocument()
        expect(queryByText("Open House")).not.toBeInTheDocument()
        expect(queryByText("Date")).not.toBeInTheDocument()
        expect(queryByText("Start Time")).not.toBeInTheDocument()
        expect(queryByText("End Time")).not.toBeInTheDocument()
        expect(queryByText("URL")).not.toBeInTheDocument()
        expect(queryByText("Open House Notes")).not.toBeInTheDocument()
        expect(queryByText("Done")).not.toBeInTheDocument()
      })

      it("should display all the Application Dates data", () => {
        const { getByText } = render(
          <ListingContext.Provider
            value={{
              ...listing,
              applicationDueDate: new Date(2024, 11, 20, 15, 30),
              listingEvents: [
                {
                  id: "event_id_1",
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  type: ListingEventsTypeEnum.openHouse,
                  startDate: new Date(2024, 1, 18, 10, 30),
                  startTime: new Date(2024, 1, 18, 10, 30),
                  endTime: new Date(2024, 1, 18, 12, 15),
                  url: "http://test.url.com",
                  note: "Test lottery note",
                },
              ],
            }}
          >
            <DetailApplicationDates />
          </ListingContext.Provider>
        )

        expect(getByText("Application Dates")).toBeInTheDocument()
        expect(getByText("Application Due Date")).toBeInTheDocument()
        expect(getByText("12/20/2024")).toBeInTheDocument()
        expect(getByText("Application Due Time")).toBeInTheDocument()
        expect(getByText("03:30 PM")).toBeInTheDocument()
        expect(getByText("Open Houses")).toBeInTheDocument()
        expect(getByText("Date")).toBeInTheDocument()
        expect(getByText("02/18/2024")).toBeInTheDocument()
        expect(getByText("Start Time")).toBeInTheDocument()
        expect(getByText("10:30 AM")).toBeInTheDocument()
        expect(getByText("End Time")).toBeInTheDocument()
        expect(getByText("12:15 PM")).toBeInTheDocument()
        expect(getByText("Link")).toBeInTheDocument()

        const urlButton = getByText("URL", { selector: "a" })
        expect(urlButton).toBeInTheDocument()
        expect(urlButton).toHaveAttribute("href", "http://test.url.com")

        expect(getByText("View")).toBeInTheDocument()
      })
    })

    describe("should display Verification section", () => {
      it("section should be hiden when jurisdiction flag is not set", () => {
        const { queryByText } = render(
          <AuthContext.Provider
            value={{
              profile: { ...user, jurisdictions: [], listings: [] },
              doJurisdictionsHaveFeatureFlagOn: () => false,
            }}
          >
            <ListingContext.Provider
              value={{
                ...listing,
                isVerified: true,
              }}
            >
              <DetailListingVerification />
            </ListingContext.Provider>
          </AuthContext.Provider>
        )

        expect(queryByText("Verification")).not.toBeInTheDocument()
        expect(queryByText("I verify that this lisiting data is valid")).not.toBeInTheDocument()
        expect(queryByText("Yes")).not.toBeInTheDocument()
      })

      it("should render section when jurisdiction flag is set", () => {
        const { getByText } = render(
          <AuthContext.Provider
            value={{
              profile: { ...user, jurisdictions: [], listings: [] },
              doJurisdictionsHaveFeatureFlagOn: () => true,
            }}
          >
            <ListingContext.Provider
              value={{
                ...listing,
                isVerified: true,
              }}
            >
              <DetailListingVerification />
            </ListingContext.Provider>
          </AuthContext.Provider>
        )

        expect(getByText("Verification")).toBeInTheDocument()
        expect(getByText("I verify that this lisiting data is valid")).toBeInTheDocument()
        expect(getByText("Yes")).toBeInTheDocument()
      })
    })
  })

  describe("should display a proper listing status", () => {
    const AVAILABLE_STATUS_OPTIONS = [
      {
        statusEnum: ListingsStatusEnum.active,
        tagString: "Open",
      },
      {
        statusEnum: ListingsStatusEnum.changesRequested,
        tagString: "Changes Requested",
      },
      {
        statusEnum: ListingsStatusEnum.closed,
        tagString: "Closed",
      },
      {
        statusEnum: ListingsStatusEnum.pending,
        tagString: "Draft",
      },
      {
        statusEnum: ListingsStatusEnum.pendingReview,
        tagString: "Pending Review",
      },
    ].map((item) =>
      Object.assign(item, {
        toString: function () {
          return this.tagString
        },
      })
    )

    it.each(AVAILABLE_STATUS_OPTIONS)(
      "should display proper string for %s status",
      async (status) => {
        document.cookie = "access-token-available=True"
        server.use(
          rest.get("http://localhost/api/adapter/user", (_req, res, ctx) => {
            return res(ctx.json(user))
          }),
          rest.get("http://localhost:3100/listings/Uvbk5qurpB2WI9V6WnNdH", (_req, res, ctx) => {
            return res(ctx.json(listing))
          })
        )
        jest.spyOn(console, "error").mockImplementation()

        const result = await getServerSideProps(MOCK_CONTEXT)

        const { findByText } = render(
          <AuthContext.Provider
            value={{
              profile: {
                ...user,
                listings: [],
                jurisdictions: [jurisdiction],
              },
              doJurisdictionsHaveFeatureFlagOn: () => true,
            }}
          >
            <ListingDetail
              listing={{
                ...result.props.listing,
                status: status.statusEnum,
              }}
            />
          </AuthContext.Provider>
        )

        const statusTag = await findByText(status.tagString)
        expect(statusTag).toBeInTheDocument()
      }
    )
  })

  describe("should display working listing form actions buttons", () => {
    it("should setup listign setup button", async () => {
      document.cookie = "access-token-available=True"
      server.use(
        rest.get("http://localhost/api/adapter/user", (_req, res, ctx) => {
          return res(ctx.json(user))
        }),
        rest.get("http://localhost:3100/listings/Uvbk5qurpB2WI9V6WnNdH", (_req, res, ctx) => {
          return res(ctx.json(listing))
        })
      )
      jest.spyOn(console, "error").mockImplementation()

      const result = await getServerSideProps(MOCK_CONTEXT)

      const { getByText } = render(
        <AuthContext.Provider
          value={{
            profile: {
              ...user,
              listings: [],
              jurisdictions: [jurisdiction],
            },
            doJurisdictionsHaveFeatureFlagOn: () => true,
          }}
        >
          <ListingDetail listing={result.props.listing} />
        </AuthContext.Provider>
      )

      const editButton = getByText("Edit")
      expect(editButton).toBeInTheDocument()
      expect(editButton).toHaveAttribute("href", "/listings/Uvbk5qurpB2WI9V6WnNdH/edit")
    })

    describe("should handle copy button request", () => {
      it("should display copy lisitng dialog", async () => {
        document.cookie = "access-token-available=True"
        server.use(
          rest.get("http://localhost/api/adapter/user", (_req, res, ctx) => {
            return res(ctx.json(user))
          }),
          rest.get("http://localhost:3100/listings/Uvbk5qurpB2WI9V6WnNdH", (_req, res, ctx) => {
            return res(ctx.json(listing))
          })
        )
        jest.spyOn(console, "error").mockImplementation()

        const result = await getServerSideProps(MOCK_CONTEXT)

        const { getByText } = render(
          <AuthContext.Provider
            value={{
              profile: {
                ...user,
                listings: [],
                jurisdictions: [jurisdiction],
              },
              doJurisdictionsHaveFeatureFlagOn: () => true,
            }}
          >
            <ListingDetail listing={result.props.listing} />
          </AuthContext.Provider>
        )

        const copyButton = getByText("Copy", { selector: "button" })
        expect(copyButton).toBeInTheDocument()

        fireEvent.click(copyButton)

        const copyDialogHeader = getByText("Copy Listing", { selector: "h1" })
        expect(copyDialogHeader).toBeInTheDocument()

        const copyDialogForm = copyDialogHeader.parentElement.parentElement
        expect(
          within(copyDialogForm).getByText(
            "You are duplicating a listing to draft status. Please enter a unique name below and indicate whether or not you’d like to include existing unit data."
          )
        ).toBeInTheDocument()
        expect(within(copyDialogForm).getByLabelText("Listing Name")).toBeInTheDocument()
        expect(within(copyDialogForm).getByLabelText("Listing Name")).toHaveAttribute(
          "value",
          "Archer Studios Copy"
        )
        expect(within(copyDialogForm).getByLabelText("Unit data")).toBeInTheDocument()
        expect(
          within(copyDialogForm).getByText(
            "Unit data will automatically be copied unless this box is unchecked."
          )
        ).toBeInTheDocument()
        expect(within(copyDialogForm).getByText("Cancel")).toBeInTheDocument()
        expect(within(copyDialogForm).getByText("Copy")).toBeInTheDocument()
      })

      it("should close dialog on cancel click", async () => {
        document.cookie = "access-token-available=True"
        server.use(
          rest.get("http://localhost/api/adapter/user", (_req, res, ctx) => {
            return res(ctx.json(user))
          }),
          rest.get("http://localhost:3100/listings/Uvbk5qurpB2WI9V6WnNdH", (_req, res, ctx) => {
            return res(ctx.json(listing))
          })
        )
        jest.spyOn(console, "error").mockImplementation()

        const result = await getServerSideProps(MOCK_CONTEXT)

        const { getByText, queryByText } = render(
          <AuthContext.Provider
            value={{
              profile: {
                ...user,
                listings: [],
                jurisdictions: [jurisdiction],
              },
              doJurisdictionsHaveFeatureFlagOn: () => true,
            }}
          >
            <ListingDetail listing={result.props.listing} />
          </AuthContext.Provider>
        )

        const copyButton = getByText("Copy", { selector: "button" })
        expect(copyButton).toBeInTheDocument()

        fireEvent.click(copyButton)

        let copyDialogHeader = getByText("Copy Listing", { selector: "h1" })
        expect(copyDialogHeader).toBeInTheDocument()

        const copyDialogForm = copyDialogHeader.parentElement.parentElement
        const cancelDialogButton = within(copyDialogForm).getByText("Cancel", {
          selector: "button",
        })

        expect(cancelDialogButton).toBeInTheDocument()
        fireEvent.click(cancelDialogButton)

        copyDialogHeader = queryByText("Copy Listing", { selector: "h1" })
        expect(copyDialogHeader).not.toBeInTheDocument()
      })
    })

    it("should setup listing preview button", async () => {
      document.cookie = "access-token-available=True"
      server.use(
        rest.get("http://localhost/api/adapter/user", (_req, res, ctx) => {
          return res(ctx.json(user))
        }),
        rest.get("http://localhost:3100/listings/Uvbk5qurpB2WI9V6WnNdH", (_req, res, ctx) => {
          return res(ctx.json(listing))
        })
      )
      jest.spyOn(console, "error").mockImplementation()

      const result = await getServerSideProps(MOCK_CONTEXT)

      const { getByText } = render(
        <AuthContext.Provider
          value={{
            profile: {
              ...user,
              listings: [],
              jurisdictions: [{ ...jurisdiction, id: "id" }],
            },
            doJurisdictionsHaveFeatureFlagOn: () => true,
          }}
        >
          <ListingDetail listing={result.props.listing} />
        </AuthContext.Provider>
      )

      const previewButton = getByText("Preview")
      expect(previewButton).toBeInTheDocument()
      expect(previewButton).toHaveAttribute("href", "/preview/listings/Uvbk5qurpB2WI9V6WnNdH")
    })
  })

  it("should display unit drawer details section", async () => {
    document.cookie = "access-token-available=True"
    server.use(
      rest.get("http://localhost/api/adapter/user", (_req, res, ctx) => {
        return res(ctx.json(user))
      }),
      rest.get("http://localhost:3100/listings/Uvbk5qurpB2WI9V6WnNdH", (_req, res, ctx) => {
        return res(ctx.json(listing))
      })
    )
    jest.spyOn(console, "error").mockImplementation()

    const result = await getServerSideProps(MOCK_CONTEXT)

    const { getByText, queryByText } = render(
      <AuthContext.Provider
        value={{
          profile: {
            ...user,
            listings: [],
            jurisdictions: [jurisdiction],
          },
          doJurisdictionsHaveFeatureFlagOn: () => true,
        }}
      >
        <ListingDetail
          listing={{
            ...result.props.listing,
            units: [
              {
                ...result.props.listing.units[0],
                number: `#1`,
                numBathrooms: 1,
                unitAccessibilityPriorityTypes: {
                  id: `ada_1`,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  name: `Test ADA_1`,
                },
              },
            ],
          }}
        />
      </AuthContext.Provider>
    )

    const unitSectionHeader = getByText("Listing Units", { selector: "h2" })
    expect(unitSectionHeader).toBeInTheDocument()
    const unitSection = unitSectionHeader.parentElement
    expect(unitSection).toBeInTheDocument()
    const unitViewButton = within(unitSection).getByText("View", { selector: "button" })
    expect(unitViewButton).toBeInTheDocument()

    fireEvent.click(unitViewButton)

    let unitDrawerHeader = getByText("Unit", { selector: "h1" })
    expect(unitDrawerHeader).toBeInTheDocument()

    const unitDrawer = unitDrawerHeader.parentElement.parentElement

    // Details section
    const detailsSectionHeader = within(unitDrawer).getByText("Details", { selector: "h2" })
    expect(detailsSectionHeader).toBeInTheDocument()
    const detailsSection = detailsSectionHeader.parentElement
    expect(within(detailsSection).getByText("Unit Number")).toBeInTheDocument()
    expect(within(detailsSection).getByText("Unit Type")).toBeInTheDocument()
    expect(within(detailsSection).getByText("Number of Bathrooms")).toBeInTheDocument()
    expect(within(detailsSection).getByText("Unit Floor")).toBeInTheDocument()
    expect(within(detailsSection).getByText("Square Footage")).toBeInTheDocument()
    expect(within(detailsSection).getByText("Minimum Occupancy")).toBeInTheDocument()
    expect(within(detailsSection).getByText("Max Occupancy")).toBeInTheDocument()
    expect(within(detailsSection).getByText("#1")).toBeInTheDocument()
    expect(within(detailsSection).getByText("Studio")).toBeInTheDocument()
    expect(within(detailsSection).getByText("285")).toBeInTheDocument()
    expect(within(detailsSection).getAllByText("1")).toHaveLength(2)
    expect(within(detailsSection).getAllByText("2")).toHaveLength(2)

    // Eligibility section
    const eligibilitySectionHeader = within(unitDrawer).getByText("Eligibility", { selector: "h2" })
    expect(eligibilitySectionHeader).toBeInTheDocument()
    const eligibilitySection = eligibilitySectionHeader.parentElement
    expect(within(eligibilitySection).getByText("AMI Chart")).toBeInTheDocument()
    expect(within(eligibilitySection).getByText("n/a")).toBeInTheDocument()
    expect(within(eligibilitySection).getByText("Percentage of AMI")).toBeInTheDocument()
    expect(within(eligibilitySection).getByText("45.0")).toBeInTheDocument()
    expect(within(eligibilitySection).getByText("Minimum Monthly Income")).toBeInTheDocument()
    expect(within(eligibilitySection).getByText("2208.0")).toBeInTheDocument()
    expect(within(eligibilitySection).getByText("Monthly Rent")).toBeInTheDocument()
    expect(within(eligibilitySection).getByText("1104.0")).toBeInTheDocument()

    // Accessibility section
    const accessibilitySectionHeader = within(unitDrawer).getByText("Accessibility", {
      selector: "h2",
    })
    expect(accessibilitySectionHeader).toBeInTheDocument()
    const accessibilitySection = accessibilitySectionHeader.parentElement
    expect(
      within(accessibilitySection).getByText("Accessibility Priority Type")
    ).toBeInTheDocument()
    expect(within(accessibilitySection).getByText("Test ADA_1")).toBeInTheDocument()

    // Should close on done
    const doneButton = within(unitDrawer).getByText("Done", {
      selector: "button",
    })
    expect(doneButton).toBeInTheDocument()
    fireEvent.click(doneButton)

    unitDrawerHeader = queryByText("Unit", { selector: "h1" })
    expect(unitDrawerHeader).not.toBeInTheDocument()
  })
})

import { LatitudeLongitude, TimeFieldPeriod } from "@bloom-housing/ui-components"
import {
  ApplicationAddressTypeEnum,
  Listing,
  ListingEvent,
  ListingsStatusEnum,
  MultiselectQuestion,
  PaperApplication,
  PaperApplicationCreate,
  RegionEnum,
  Unit,
  User,
  YesNoEnum,
} from "@bloom-housing/shared-helpers/src/types/backend-swagger"

export enum AnotherAddressEnum {
  anotherAddress = "anotherAddress",
}

export type FormListing = Omit<Listing, "countyCode"> & {
  applicationDueDateField?: {
    month: string
    day: string
    year: string
  }
  applicationDueTimeField?: {
    hours: string
    minutes: string
    period: TimeFieldPeriod
  }
  postmarkByDateDateField?: {
    month: string
    day: string
    year: string
  }
  postmarkByDateTimeField?: {
    hours: string
    minutes: string
    period: TimeFieldPeriod
  }
  arePostmarksConsidered?: YesNoEnum
  canApplicationsBeDroppedOff?: YesNoEnum
  canPaperApplicationsBePickedUp?: YesNoEnum
  canApplicationsBeMailedIn?: YesNoEnum
  digitalApplicationChoice?: YesNoEnum
  commonDigitalApplicationChoice?: YesNoEnum
  paperApplicationChoice?: YesNoEnum
  referralOpportunityChoice?: YesNoEnum
  criteriaAttachType?: string
  includeCommunityDisclaimerQuestion?: YesNoEnum
  communityDisclaimerTitle?: string
  communityDisclaimerDescription?: string
  lotteryDate?: {
    month: string
    day: string
    year: string
  }
  lotteryStartTime?: {
    hours: string
    minutes: string
    period: TimeFieldPeriod
  }
  lotteryEndTime?: {
    hours: string
    minutes: string
    period: TimeFieldPeriod
  }
  lotteryDateNotes?: string
  postMarkDate?: {
    month: string
    day: string
    year: string
  }
  reviewOrderQuestion?: string
  lotteryOptInQuestion?: YesNoEnum
  listingAvailabilityQuestion?: string
  waitlistOpenQuestion?: YesNoEnum
  waitlistSizeQuestion?: YesNoEnum
  whereApplicationsDroppedOff?: ApplicationAddressTypeEnum | AnotherAddressEnum
  whereApplicationsPickedUp?: ApplicationAddressTypeEnum | AnotherAddressEnum
  whereApplicationsMailedIn?: ApplicationAddressTypeEnum | AnotherAddressEnum
  accessibilityFeatures?: string[]
  utilities?: string[]
}

export const addressTypes = {
  ...ApplicationAddressTypeEnum,
  anotherAddress: AnotherAddressEnum.anotherAddress,
}

export type AlertErrorType = "api" | "form"

export const formDefaults: FormListing = {
  id: undefined,
  createdAt: undefined,
  updatedAt: undefined,
  applicationDueDate: null,
  applicationFee: null,
  applicationMethods: [],
  applicationOpenDate: new Date(),
  applicationOrganization: "",
  listingsApplicationPickUpAddress: null,
  applicationPickUpAddressOfficeHours: "",
  listingsApplicationMailingAddress: null,
  listingsApplicationDropOffAddress: null,
  applicationDropOffAddressOfficeHours: null,
  assets: [],
  buildingSelectionCriteria: "",
  listingsBuildingSelectionCriteriaFile: null,
  criteriaAttachType: "",
  jurisdictions: undefined,
  costsNotIncluded: "",
  creditHistory: "",
  criminalBackground: "",
  depositMax: "0",
  depositMin: "0",
  depositHelperText: "or one month's rent may be higher for lower credit scores",
  disableUnitsAccordion: false,
  displayWaitlistSize: false,
  listingEvents: [],
  listingImages: [],
  listingFeatures: null,
  listingUtilities: null,
  listingsLeasingAgentAddress: null,
  leasingAgentEmail: null,
  leasingAgentName: null,
  leasingAgentOfficeHours: "",
  leasingAgentPhone: null,
  leasingAgentTitle: "",
  name: null,
  postMarkDate: null,
  postmarkedApplicationsReceivedByDate: null,
  listingMultiselectQuestions: [],
  programRules: "",
  rentalAssistance: null,
  rentalHistory: "",
  requiredDocuments: "",
  status: ListingsStatusEnum.pending,
  waitlistCurrentSize: null,
  waitlistMaxSize: null,
  isWaitlistOpen: null,
  waitlistOpenSpots: null,
  whatToExpect:
    "Applicants will be contacted by the property agent in rank order until vacancies are filled. All of the information that you have provided will be verified and your eligibility confirmed. Your application will be removed from the waitlist if you have made any fraudulent statements. If we cannot verify a housing preference that you have claimed, you will not receive the preference but will not be otherwise penalized. Should your application be chosen, be prepared to fill out a more detailed application and provide required supporting documents.",
  units: [],
  accessibility: "",
  amenities: "",
  listingsBuildingAddress: null,
  buildingTotalUnits: 0,
  developer: null,
  householdSizeMax: 0,
  householdSizeMin: 0,
  neighborhood: undefined,
  region: RegionEnum.Greater_Downtown,
  petPolicy: "",
  smokingPolicy: "",
  unitsAvailable: 0,
  unitAmenities: "",
  servicesOffered: "",
  yearBuilt: null,
  // urlSlug: undefined,
  // showWaitlist: false,
  reviewOrderType: null,
  unitsSummary: [],
  applicationLotteryTotals: [],
}

export type TempUnit = Unit & {
  tempId?: number
  maxIncomeHouseholdSize1?: string
  maxIncomeHouseholdSize2?: string
  maxIncomeHouseholdSize3?: string
  maxIncomeHouseholdSize4?: string
  maxIncomeHouseholdSize5?: string
  maxIncomeHouseholdSize6?: string
  maxIncomeHouseholdSize7?: string
  maxIncomeHouseholdSize8?: string
}

export type TempEvent = ListingEvent & {
  tempId?: string
}

export type PaperApplicationHybrid = PaperApplication | PaperApplicationCreate

export type FormMetadata = {
  preferences: MultiselectQuestion[]
  programs: MultiselectQuestion[]
  units: TempUnit[]
  openHouseEvents: TempEvent[]
  profile: User
  latLong: LatitudeLongitude
  customMapPositionChosen: boolean
}

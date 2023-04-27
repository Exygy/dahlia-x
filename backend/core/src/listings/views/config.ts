import { Views } from "./types"
import { getBaseAddressSelect } from "../../views/base.view"

const views: Views = {
  base: {
    select: [
      "listings.id",
      "listings.name",
      "listings.applicationDueDate",
      "listings.applicationOpenDate",
      "listings.reviewOrderType",
      "listings.status",
      "listings.waitlistMaxSize",
      "listings.waitlistCurrentSize",
      "listings.assets",
      "listings.closedAt",
      "listings.publishedAt",
      "listings.updatedAt",
      "listings.isWaitlistOpen",
      "listings.neighborhood",
      "jurisdiction.id",
      "jurisdiction.name",
      "reservedCommunityType.id",
      "reservedCommunityType.name",
      "listings.unitsAvailable",
      ...getBaseAddressSelect(["buildingAddress"]),
      "units.id",
      "units.floor",
      "units.minOccupancy",
      "units.maxOccupancy",
      "units.monthlyIncomeMin",
      "units.monthlyRent",
      "units.monthlyRentAsPercentOfIncome",
      "units.sqFeet",
      "amiChartOverride.id",
      "amiChartOverride.items",
      "unitType.id",
      "unitType.name",
      "listingMultiselectQuestions.ordinal",
      "listingMultiselectQuestionsMultiselectQuestion.id",
      "features.id",
      "features.elevator",
      "features.wheelchairRamp",
      "features.serviceAnimalsAllowed",
      "features.accessibleParking",
      "features.parkingOnSite",
      "features.inUnitWasherDryer",
      "features.barrierFreeEntrance",
      "features.rollInShower",
      "features.grabBars",
      "features.heatingInUnit",
      "features.acInUnit",
      "features.laundryInBuilding",
      "listingImages.ordinal",
      "listingImagesImage.id",
      "listingImagesImage.fileId",
      "listingImagesImage.label",
      "utilities.id",
      "utilities.water",
      "utilities.gas",
      "utilities.trash",
      "utilities.sewer",
      "utilities.electricity",
      "utilities.cable",
      "utilities.phone",
      "utilities.internet",
    ],
    leftJoins: [
      { join: "listings.jurisdiction", alias: "jurisdiction" },
      { join: "listings.buildingAddress", alias: "buildingAddress" },
      { join: "listings.units", alias: "units" },
      { join: "units.unitType", alias: "unitType" },
      { join: "units.amiChartOverride", alias: "amiChartOverride" },
      { join: "listings.reservedCommunityType", alias: "reservedCommunityType" },
      { join: "listings.images", alias: "listingImages" },
      { join: "listingImages.image", alias: "listingImagesImage" },
      { join: "listings.listingMultiselectQuestions", alias: "listingMultiselectQuestions" },
      {
        join: "listingMultiselectQuestions.multiselectQuestion",
        alias: "listingMultiselectQuestionsMultiselectQuestion",
      },
      { join: "listings.features", alias: "features" },
      { join: "listings.utilities", alias: "utilities" },
    ],
  },
}

views.partnerList = {
  select: [
    "listings.id",
    "listings.name",
    "listings.applicationDueDate",
    "listings.status",
    "listings.waitlistMaxSize",
    "listings.waitlistCurrentSize",
    "listings.unitsAvailable",
  ],
}

views.detail = {
  select: [
    ...views.base.select,
    "listings.additionalApplicationSubmissionNotes",
    "listings.applicationFee",
    "listings.applicationOrganization",
    "listings.applicationPickUpAddressOfficeHours",
    "listings.applicationPickUpAddressType",
    "listings.applicationDropOffAddressOfficeHours",
    "listings.applicationDropOffAddressType",
    "listings.applicationMailingAddressType",
    "listings.buildingSelectionCriteria",
    "listings.costsNotIncluded",
    "listings.creditHistory",
    "listings.criminalBackground",
    "listings.depositMin",
    "listings.depositMax",
    "listings.disableUnitsAccordion",
    "listings.jurisdiction",
    "listings.leasingAgentEmail",
    "listings.leasingAgentName",
    "listings.leasingAgentOfficeHours",
    "listings.leasingAgentPhone",
    "listings.leasingAgentTitle",
    "listings.postmarkedApplicationsReceivedByDate",
    "listings.programRules",
    "listings.rentalAssistance",
    "listings.rentalHistory",
    "listings.requiredDocuments",
    "listings.specialNotes",
    "listings.whatToExpect",
    "listings.displayWaitlistSize",
    "listings.reservedCommunityDescription",
    "listings.reservedCommunityMinAge",
    "listings.resultLink",
    "listings.isWaitlistOpen",
    "listings.waitlistOpenSpots",
    "listings.customMapPin",
    "listings.features",
    "buildingSelectionCriteriaFile.id",
    "buildingSelectionCriteriaFile.fileId",
    "buildingSelectionCriteriaFile.label",
    "applicationMethods.id",
    "applicationMethods.label",
    "applicationMethods.externalReference",
    "applicationMethods.acceptsPostmarkedApplications",
    "applicationMethods.phoneNumber",
    "applicationMethods.type",
    "paperApplications.id",
    "paperApplications.language",
    "paperApplicationFile.id",
    "paperApplicationFile.fileId",
    "paperApplicationFile.label",
    "listingEvents.id",
    "listingEvents.type",
    "listingEvents.startTime",
    "listingEvents.endTime",
    "listingEvents.url",
    "listingEvents.note",
    "listingEvents.label",
    "listingEventFile.id",
    "listingEventFile.fileId",
    "listingEventFile.label",
    "result.id",
    "result.fileId",
    "result.label",
    ...getBaseAddressSelect([
      "leasingAgentAddress",
      "applicationPickUpAddress",
      "applicationMailingAddress",
      "applicationDropOffAddress",
    ]),
    "leasingAgents.firstName",
    "leasingAgents.lastName",
    "leasingAgents.email",
    "listingMultiselectQuestionsMultiselectQuestion.text",
    "listingMultiselectQuestionsMultiselectQuestion.subText",
    "listingMultiselectQuestionsMultiselectQuestion.description",
    "listingMultiselectQuestionsMultiselectQuestion.ordinal",
    "listingMultiselectQuestionsMultiselectQuestion.links",
    "listingMultiselectQuestionsMultiselectQuestion.options",
    "listings.utilities",
  ],
  leftJoins: [
    ...views.base.leftJoins,
    { join: "listings.applicationMethods", alias: "applicationMethods" },
    { join: "applicationMethods.paperApplications", alias: "paperApplications" },
    { join: "paperApplications.file", alias: "paperApplicationFile" },
    { join: "listings.buildingSelectionCriteriaFile", alias: "buildingSelectionCriteriaFile" },
    { join: "listings.events", alias: "listingEvents" },
    { join: "listingEvents.file", alias: "listingEventFile" },
    { join: "listings.result", alias: "result" },
    { join: "listings.leasingAgentAddress", alias: "leasingAgentAddress" },
    { join: "listings.applicationPickUpAddress", alias: "applicationPickUpAddress" },
    { join: "listings.applicationMailingAddress", alias: "applicationMailingAddress" },
    { join: "listings.applicationDropOffAddress", alias: "applicationDropOffAddress" },
    { join: "listings.leasingAgents", alias: "leasingAgents" },
  ],
}

views.full = {
  leftJoinAndSelect: [
    ["listings.applicationMethods", "applicationMethods"],
    ["applicationMethods.paperApplications", "paperApplications"],
    ["paperApplications.file", "paperApplicationFile"],
    ["listings.buildingSelectionCriteriaFile", "buildingSelectionCriteriaFile"],
    ["listings.events", "listingEvents"],
    ["listingEvents.file", "listingEventFile"],
    ["listings.result", "result"],
    ["listings.leasingAgentAddress", "leasingAgentAddress"],
    ["listings.applicationPickUpAddress", "applicationPickUpAddress"],
    ["listings.applicationMailingAddress", "applicationMailingAddress"],
    ["listings.applicationDropOffAddress", "applicationDropOffAddress"],
    ["listings.leasingAgents", "leasingAgents"],
    ["listings.listingMultiselectQuestions", "listingMultiselectQuestions"],
    [
      "listingMultiselectQuestions.multiselectQuestion",
      "listingMultiselectQuestionsMultiselectQuestion",
    ],
    ["listings.buildingAddress", "buildingAddress"],
    ["listings.jurisdiction", "jurisdiction"],
    ["listings.reservedCommunityType", "reservedCommunityType"],
    ["listings.features", "listing_features"],
    ["listings.images", "listingImages"],
    ["listingImages.image", "listingImagesImage"],
    ["listings.utilities", "listing_utilities"],
  ],
}
views.listingsExport = {
  select: [
    "listing.id",
    "listing.createdAt",
    "jurisdiction.id",
    "jurisdiction.name",
    "listing.name",
    "listing.status",
    "listing.publishedAt",
    "listing.updatedAt",
    "listing.developer",
    ...getBaseAddressSelect(["buildingAddress"]),
    "listing.neighborhood",
    "listing.yearBuilt",
    "reservedCommunityType.id",
    "reservedCommunityType.name",
    "buildingAddress.latitude",
    "buildingAddress.longitude",
    "listing.reviewOrderType",
    "listing.programRules",
    "listingEvents.startTime",
    "listingEvents.endTime",
    "listingEvents.note",
    "listingMultiselectQuestions.ordinal",
    "listingMultiselectQuestionsMultiselectQuestion.id",
    "listingMultiselectQuestionsMultiselectQuestion.text",
    "listingMultiselectQuestionsMultiselectQuestion.applicationSection",
    "listing.applicationFee",
    "listing.depositHelperText",
    "listing.depositMin",
    "listing.depositMax",
    "listing.costsNotIncluded",
    "listing.amenities",
    "listing.accessibility",
    "listing.unitAmenities",
    "listing.smokingPolicy",
    "listing.petPolicy",
    "listing.servicesOffered",
    "listing.creditHistory",
    "listing.rentalHistory",
    "listing.criminalBackground",
    "listing.rentalAssistance",
    "listing.buildingSelectionCriteria",
    "listing.requiredDocuments",
    "listing.programRules",
    "listing.specialNotes",
    "listing.isWaitlistOpen",
    "listing.waitlistMaxSize",
    "listing.leasingAgentName",
    "listing.leasingAgentEmail",
    "listing.leasingAgentOfficeHours",
    "listing.leasingAgentPhone",
    "listing.leasingAgentTitle",
    ...getBaseAddressSelect([
      "leasingAgentAddress",
      "applicationPickUpAddress",
      "applicationMailingAddress",
      "applicationDropOffAddress",
    ]),
    "listing.applicationPickUpAddressOfficeHours",
    "listing.digitalApplication",
    "applicationMethods.id",
    "applicationMethods.externalReference",
    "listing.paperApplication",
    "paperApplications.id",
    "paperApplicationFile.id",
    "paperApplicationFile.fileId",
    "listing.referralOpportunity",
    "listing.applicationMailingAddressType",
    "listing.applicationMailingAddress",
    "listing.applicationPickUpAddressType",
    "listing.applicationPickUpAddress",
    "listing.applicationDropOffAddressType",
    "listing.applicationDropOffAddress",
    "applicationMethods.acceptsPostmarkedApplications",
    "listing.additionalApplicationSubmissionNotes",
    "listing.applicationDueDate",
    "listingEvents.id",
    "listingEvents.type",
    "listingEvents.startTime",
    "listingEvents.endTime",
    "listingEvents.url",
    "listingEvents.note",
    "listingEvents.label",
  ],
  leftJoins: [
    { join: "listing.jurisdiction", alias: "jurisdiction" },
    { join: "listing.buildingSelectionCriteriaFile", alias: "buildingSelectionCriteriaFile" },
    { join: "listing.reservedCommunityType", alias: "reservedCommunityType" },
    { join: "listing.buildingAddress", alias: "buildingAddress" },
    { join: "listing.utilities", alias: "utilities" },
    { join: "listing.events", alias: "listingEvents" },
    { join: "listing.features", alias: "features" },
    { join: "listing.leasingAgentAddress", alias: "leasingAgentAddress" },
    { join: "listing.applicationPickUpAddress", alias: "applicationPickUpAddress" },
    { join: "listing.applicationMailingAddress", alias: "applicationMailingAddress" },
    { join: "listing.applicationDropOffAddress", alias: "applicationDropOffAddress" },
    { join: "listing.applicationMethods", alias: "applicationMethods" },
    { join: "applicationMethods.paperApplications", alias: "paperApplications" },
    { join: "paperApplications.file", alias: "paperApplicationFile" },
    { join: "listing.listingMultiselectQuestions", alias: "listingMultiselectQuestions" },
    {
      join: "listingMultiselectQuestions.multiselectQuestion",
      alias: "listingMultiselectQuestionsMultiselectQuestion",
    },
  ],
}

views.unitsExport = {
  select: [
    "listing.id",
    "listing.name",
    "units.id",
    "units.number",
    "unitType.name",
    "units.numBathrooms",
    "units.floor",
    "units.sqFeet",
    "units.minOccupancy",
    "units.maxOccupancy",
    "units.monthlyIncomeMin",
    "amiChart.id",
    "amiChart.items",
    "amiChart.name",
    "units.monthlyRent",
    "units.monthlyRentAsPercentOfIncome",
    "accessibilityType.name",
  ],
  leftJoins: [
    { join: "listing.units", alias: "units" },
    { join: "units.unitType", alias: "unitType" },
    { join: "units.amiChart", alias: "amiChart" },
    { join: "units.priorityType", alias: "accessibilityType" },
  ],
}

export { views }

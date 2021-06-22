import { Test } from "@nestjs/testing"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ListingsModule } from "../../src/listings/listings.module"
import supertest from "supertest"
import { applicationSetup } from "../../src/app.module"
import { allSeeds } from "../../src/seeds/listings"
import { ListingDto } from "../../src/listings/dto/listing.dto"
import { getUserAccessToken } from "../utils/get-user-access-token"
import { setAuthorization } from "../utils/set-authorization-helper"

// eslint-disable-next-line @typescript-eslint/no-var-requires
const dbOptions = require("../../ormconfig.test")

// Cypress brings in Chai types for the global expect, but we want to use jest
// expect here so we need to re-declare it.
// see: https://github.com/cypress-io/cypress/issues/1319#issuecomment-593500345
declare const expect: jest.Expect
jest.setTimeout(30000)

describe("Listings", () => {
  let app
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot(dbOptions), ListingsModule],
    }).compile()
    app = moduleRef.createNestApplication()
    app = applicationSetup(app)
    await app.init()
  })

  it("should return all listings", async () => {
    const res = await supertest(app.getHttpServer()).get("/listings").expect(200)
    expect(res.body.length).toEqual(allSeeds.length)
  })

  it("should return only the specified listings", async () => {
    const query =
      "/?jsonpath=%24%5B%3F%28%40.applicationAddress.city%3D%3D%22Foster%20City%22%29%5D"
    const res = await supertest(app.getHttpServer()).get(`/listings${query}`).expect(200)
    expect(res.body.length).toEqual(1)
    expect(res.body[0].applicationAddress.city).toEqual("Foster City")
  })

  it("shouldn't return any listings for incorrect query", async () => {
    const query = "/?jsonpath=%24%5B%3F(%40.applicationNONSENSE.argh%3D%3D%22San+Jose%22)%5D"
    const res = await supertest(app.getHttpServer()).get(`/listings${query}`).expect(200)
    expect(res.body.length).toEqual(0)
  })

  it("should return only active listings", async () => {
    const query = "/?jsonpath=%24%5B%3F%28%40.status%3D%3D%22active%22%29%5D"
    const res = await supertest(app.getHttpServer()).get(`/listings${query}`).expect(200)
    expect(res.body.length).toEqual(allSeeds.length)
  })

  it("should modify property related fields of a listing and return a modified value", async () => {
    const res = await supertest(app.getHttpServer()).get("/listings").expect(200)

    const listing: ListingDto = { ...res.body[0] }

    const amenitiesValue = "Random amenities value"
    expect(listing.amenities).not.toBe(amenitiesValue)
    listing.amenities = amenitiesValue

    const oldOccupancy = listing.units[0].maxOccupancy
    listing.units[0].maxOccupancy = oldOccupancy + 1

    const adminAccessToken = await getUserAccessToken(app, "admin@example.com", "abcdef")

    const putResponse = await supertest(app.getHttpServer())
      .put(`/listings/${listing.id}`)
      .send(listing)
      .set(...setAuthorization(adminAccessToken))
      .expect(200)
    const modifiedListing: ListingDto = putResponse.body

    expect(modifiedListing.amenities).toBe(amenitiesValue)
    expect(modifiedListing.units[0].maxOccupancy).toBe(oldOccupancy + 1)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(async () => {
    await app.close()
  })
})

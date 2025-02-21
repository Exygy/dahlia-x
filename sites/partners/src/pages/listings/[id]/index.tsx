import React, { useState } from "react"
import Head from "next/head"
import axios from "axios"
import { t, AlertBox, Breadcrumbs, BreadcrumbLink } from "@bloom-housing/ui-components"
import {
  Listing,
  ListingsStatusEnum,
  ReviewOrderTypeEnum,
} from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import { ListingStatusBar } from "../../../components/listings/ListingStatusBar"
import ListingGuard from "../../../components/shared/ListingGuard"
import { NavigationHeader } from "../../../components/shared/NavigationHeader"
import Layout from "../../../layouts/index"
import ListingFormActions, {
  ListingFormActionsType,
} from "../../../components/listings/ListingFormActions"
import { ListingContext } from "../../../components/listings/ListingContext"
import DetailListingData from "../../../components/listings/PaperListingDetails/sections/DetailListingData"
import DetailListingIntro from "../../../components/listings/PaperListingDetails/sections/DetailListingIntro"
import DetailListingPhotos from "../../../components/listings/PaperListingDetails/sections/DetailListingPhotos"
import DetailBuildingDetails from "../../../components/listings/PaperListingDetails/sections/DetailBuildingDetails"
import DetailAdditionalDetails from "../../../components/listings/PaperListingDetails/sections/DetailAdditionalDetails"
import DetailAdditionalEligibility from "../../../components/listings/PaperListingDetails/sections/DetailAdditionalEligibility"
import DetailLeasingAgent from "../../../components/listings/PaperListingDetails/sections/DetailLeasingAgent"
import DetailAdditionalFees from "../../../components/listings/PaperListingDetails/sections/DetailAdditionalFees"
import { DetailUnits } from "../../../components/listings/PaperListingDetails/sections/DetailUnits"
import DetailUnitDrawer, {
  UnitDrawer,
} from "../../../components/listings/PaperListingDetails/DetailsUnitDrawer"
import DetailBuildingFeatures from "../../../components/listings/PaperListingDetails/sections/DetailBuildingFeatures"
import DetailRankingsAndResults from "../../../components/listings/PaperListingDetails/sections/DetailRankingsAndResults"
import DetailApplicationTypes from "../../../components/listings/PaperListingDetails/sections/DetailApplicationTypes"
import DetailApplicationAddress from "../../../components/listings/PaperListingDetails/sections/DetailApplicationAddress"
import DetailApplicationDates from "../../../components/listings/PaperListingDetails/sections/DetailApplicationDates"
import DetailPreferences from "../../../components/listings/PaperListingDetails/sections/DetailPreferences"
import DetailCommunityType from "../../../components/listings/PaperListingDetails/sections/DetailCommunityType"
import DetailPrograms from "../../../components/listings/PaperListingDetails/sections/DetailPrograms"
import DetailListingNotes from "../../../components/listings/PaperListingDetails/sections/DetailNotes"
import CopyListingDialog from "../../../components/listings/PaperListingForm/dialogs/CopyListingDialog"
import DetailListingVerification from "../../../components/listings/PaperListingDetails/sections/DetailListingVerification"

interface ListingProps {
  listing: Listing
}

export default function ListingDetail(props: ListingProps) {
  const { listing } = props
  const [errorAlert, setErrorAlert] = useState<string>(null)
  const [unitDrawer, setUnitDrawer] = useState<UnitDrawer>(null)
  const [copyListingDialog, setCopyListingDialog] = useState(false)

  if (!listing) return null

  return (
    <ListingContext.Provider value={listing}>
      <ListingGuard>
        <>
          <Layout>
            <Head>
              <title>{t("nav.siteTitlePartners")}</title>
            </Head>
            <NavigationHeader
              title={listing.name}
              listingId={listing.id}
              tabs={{
                show: listing.status !== ListingsStatusEnum.pending,
                listingLabel: t("t.listingSingle"),
                applicationsLabel: t("nav.applications"),
                lotteryLabel:
                  listing.status === ListingsStatusEnum.closed &&
                  listing?.lotteryOptIn &&
                  listing?.reviewOrderType === ReviewOrderTypeEnum.lottery
                    ? t("listings.lotteryTitle")
                    : undefined,
              }}
              breadcrumbs={
                <Breadcrumbs>
                  <BreadcrumbLink href="/">{t("t.listing")}</BreadcrumbLink>
                  <BreadcrumbLink href={`/listings/${listing.id}`} current>
                    {listing.name}
                  </BreadcrumbLink>
                </Breadcrumbs>
              }
            />

            <ListingStatusBar status={listing.status} />

            <section className="bg-primary-lighter">
              <div className="mx-auto px-5 mt-5 max-w-screen-xl">
                {errorAlert && (
                  <AlertBox
                    className="mb-5"
                    onClose={() => setErrorAlert(null)}
                    closeable
                    type="alert"
                  >
                    {errorAlert || t("authentication.signIn.errorGenericMessage")}
                  </AlertBox>
                )}

                <div className="flex flex-row flex-wrap ">
                  <div className="info-card md:w-9/12 overflow-hidden">
                    <DetailListingData />
                    <DetailListingNotes />
                    <DetailListingIntro />
                    <DetailListingPhotos />
                    <DetailBuildingDetails />
                    <DetailCommunityType />
                    <DetailUnits setUnitDrawer={setUnitDrawer} />
                    <DetailPreferences />
                    <DetailPrograms />
                    <DetailAdditionalFees />
                    <DetailBuildingFeatures />
                    <DetailAdditionalEligibility />
                    <DetailAdditionalDetails />
                    <DetailRankingsAndResults />
                    <DetailLeasingAgent />
                    <DetailApplicationTypes />
                    <DetailApplicationAddress />
                    <DetailApplicationDates />
                    <DetailListingVerification />
                  </div>

                  <div className="w-full md:w-3/12 md:pl-6">
                    <ListingFormActions
                      type={ListingFormActionsType.details}
                      showCopyListingDialog={() => setCopyListingDialog(true)}
                      setErrorAlert={setErrorAlert}
                    />
                  </div>
                </div>
              </div>
            </section>
          </Layout>

          <DetailUnitDrawer unit={unitDrawer} setUnitDrawer={setUnitDrawer} />
          <CopyListingDialog
            isOpen={copyListingDialog}
            setOpen={setCopyListingDialog}
            listingInfo={{ name: listing.name, id: listing.id }}
          />
        </>
      </ListingGuard>
    </ListingContext.Provider>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getServerSideProps(context: { params: Record<string, string>; req: any }) {
  let response

  try {
    response = await axios.get(`${process.env.backendApiBase}/listings/${context.params.id}`, {
      headers: {
        passkey: process.env.API_PASS_KEY,
        "x-forwarded-for":
          context.req.headers["x-forwarded-for"] ?? context.req.socket.remoteAddress,
      },
    })
  } catch (e) {
    return { notFound: true }
  }

  return { props: { listing: response.data } }
}

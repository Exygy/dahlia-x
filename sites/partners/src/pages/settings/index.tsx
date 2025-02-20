import React, { useContext, useState, useMemo, useEffect } from "react"
import Head from "next/head"
import { useSWRConfig } from "swr"

import {
  LoadingOverlay,
  MinimalTable,
  StandardCard,
  t,
  useMutate,
} from "@bloom-housing/ui-components"
import { Button, Dialog } from "@bloom-housing/ui-seeds"
import dayjs from "dayjs"
import { AuthContext, MessageContext } from "@bloom-housing/shared-helpers"
import Layout from "../../layouts"
import PreferenceDrawer from "../../components/settings/PreferenceDrawer"
import { useJurisdictionalMultiselectQuestionList } from "../../lib/hooks"
import ManageIconSection from "../../components/settings/ManageIconSection"
import { PreferenceDeleteModal } from "../../components/settings/PreferenceDeleteModal"
import { NavigationHeader } from "../../components/shared/NavigationHeader"
import {
  MultiselectQuestion,
  MultiselectQuestionCreate,
  MultiselectQuestionUpdate,
  MultiselectQuestionsApplicationSectionEnum,
} from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import { PreferenceEditModal } from "../../components/settings/PreferenceEditModal"

export type DrawerType = "add" | "edit"

const Settings = () => {
  const { mutate } = useSWRConfig()

  const { profile, multiselectQuestionsService } = useContext(AuthContext)
  const { addToast } = useContext(MessageContext)

  const { mutate: updateQuestion, isLoading: isUpdateLoading } = useMutate()
  const { mutate: createQuestion, isLoading: isCreateLoading } = useMutate()

  const [preferenceDrawerOpen, setPreferenceDrawerOpen] = useState<DrawerType | null>(null)
  const [copyModalOpen, setCopyModalOpen] = useState<MultiselectQuestion>(null)
  const [questionData, setQuestionData] = useState<MultiselectQuestion>(null)
  const [updatedIds, setUpdatedIds] = useState<string[]>([])
  const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState<MultiselectQuestion | null>(
    null
  )
  const [editConfirmModalOpen, setEditConfirmModalOpen] = useState<MultiselectQuestion | null>(null)

  const { data, loading, cacheKey } = useJurisdictionalMultiselectQuestionList(
    profile?.jurisdictions?.map((jurisdiction) => jurisdiction.id).toString(),
    MultiselectQuestionsApplicationSectionEnum.preferences
  )

  const tableData = useMemo(() => {
    return data
      ?.sort((a, b) => {
        const aChar = a.text.toUpperCase()
        const bChar = b.text.toUpperCase()
        if (aChar === bChar)
          return a.updatedAt > b.updatedAt ? -1 : a.updatedAt < b.updatedAt ? 1 : 0
        return aChar.localeCompare(bChar)
      })
      .map((preference) => {
        return {
          name: {
            content: preference?.text,
          },
          jurisdiction: {
            content: preference?.jurisdictions?.reduce((acc, item, index) => {
              return `${acc}${index > 0 ? ", " : ""}${item.name}`
            }, ""),
          },

          updated: {
            content: dayjs(preference?.updatedAt).format("MM/DD/YYYY"),
          },
          icons: {
            content: (
              <ManageIconSection
                onCopy={() => setCopyModalOpen(preference)}
                copyTestId={`preference-copy-icon: ${preference.text}`}
                onEdit={() => setEditConfirmModalOpen(preference)}
                editTestId={`preference-edit-icon: ${preference.text}`}
                onDelete={() => setDeleteConfirmModalOpen(preference)}
                deleteTestId={`preference-delete-icon: ${preference.text}`}
              />
            ),
          },
        }
      })
  }, [data])

  useEffect(() => {
    if (!isCreateLoading) {
      setCopyModalOpen(null)
    }
  }, [isCreateLoading])

  const saveQuestion = (formattedData: MultiselectQuestionCreate, requestType: DrawerType) => {
    if (requestType === "edit") {
      void updateQuestion(() =>
        multiselectQuestionsService
          .update({
            body: {
              ...(formattedData as unknown as MultiselectQuestionUpdate),
              id: questionData.id,
            },
          })
          .then((result) => {
            setUpdatedIds(
              updatedIds.find((existingId) => existingId === result.id)
                ? updatedIds
                : [...updatedIds, result.id]
            )
            addToast(t(`settings.preferenceAlertUpdated`), { variant: "success" })
          })
          .catch((e) => {
            addToast(t(`errors.alert.badRequest`), { variant: "alert" })
            console.log(e)
          })
          .finally(() => {
            setPreferenceDrawerOpen(null)
            void mutate(cacheKey)
          })
      )
    } else {
      void createQuestion(() =>
        multiselectQuestionsService
          .create({
            body: formattedData as unknown as MultiselectQuestionCreate,
          })
          .then((result) => {
            setUpdatedIds(
              updatedIds.find((existingId) => existingId === result.id)
                ? updatedIds
                : [...updatedIds, result.id]
            )
            addToast(t(`settings.preferenceAlertCreated`), { variant: "success" })
          })
          .catch((e) => {
            addToast(t(`errors.alert.badRequest`), { variant: "alert" })
            console.log(e)
          })
          .finally(() => {
            setPreferenceDrawerOpen(null)
            void mutate(cacheKey)
          })
      )
    }
  }

  const getCardContent = () => {
    if (!loading && data?.length === 0) return null
    return (
      <>
        {data?.length ? (
          <MinimalTable
            headers={{
              name: "t.name",
              jurisdiction: "t.jurisdiction",
              updated: "t.updated",
              icons: "",
            }}
            cellClassName={"px-5 py-3"}
            data={tableData}
          />
        ) : (
          <div className={"ml-5 mb-5"}>{t("t.none")}</div>
        )}
      </>
    )
  }

  return (
    <>
      <Layout>
        <Head>
          <title>{t("nav.siteTitlePartners")}</title>
        </Head>
        <NavigationHeader className="relative" title={t("t.settings")} />
        <section>
          <article className="flex-row flex-wrap relative max-w-screen-xl mx-auto py-8 px-4">
            <LoadingOverlay isLoading={loading}>
              <StandardCard
                title={t("t.preferences")}
                emptyStateMessage={t("t.none")}
                footer={
                  <Button
                    size="sm"
                    onClick={() => {
                      setQuestionData(null)
                      setPreferenceDrawerOpen("add")
                    }}
                    id={"preference-add-item"}
                    disabled={loading}
                  >
                    {t("t.addItem")}
                  </Button>
                }
              >
                {getCardContent()}
              </StandardCard>
            </LoadingOverlay>
          </article>
        </section>
      </Layout>

      <PreferenceDrawer
        drawerOpen={!!preferenceDrawerOpen}
        questionData={questionData}
        setQuestionData={setQuestionData}
        drawerType={preferenceDrawerOpen}
        onDrawerClose={() => {
          setPreferenceDrawerOpen(null)
          void mutate(cacheKey)
        }}
        saveQuestion={saveQuestion}
        isLoading={isCreateLoading || isUpdateLoading}
      />

      <Dialog
        isOpen={!!copyModalOpen}
        ariaLabelledBy="settings-dialog-header"
        onClose={() => setCopyModalOpen(null)}
      >
        <Dialog.Header id="settings-dialog-header">{t("t.copy")}</Dialog.Header>
        <Dialog.Content>{t("settings.createCopyDescription")}</Dialog.Content>
        <Dialog.Footer>
          <Button
            type="button"
            variant="primary-outlined"
            onClick={() => {
              saveQuestion({ ...copyModalOpen, text: `${copyModalOpen.text} (Copy)` }, "add")
            }}
            id={"copy-button-confirm"}
            loadingMessage={isCreateLoading && t("t.formSubmitted")}
            size="sm"
          >
            {t("actions.copy")}
          </Button>
          <Button
            variant="primary-outlined"
            type="button"
            onClick={() => {
              setCopyModalOpen(null)
            }}
            disabled={isCreateLoading}
            id={"copy-button-cancel"}
            size="sm"
          >
            {t("t.cancel")}
          </Button>
        </Dialog.Footer>
      </Dialog>
      {deleteConfirmModalOpen && (
        <PreferenceDeleteModal
          multiselectQuestion={deleteConfirmModalOpen}
          onClose={() => {
            setDeleteConfirmModalOpen(null)
            void mutate(cacheKey)
          }}
        />
      )}
      {editConfirmModalOpen && (
        <PreferenceEditModal
          multiselectQuestion={editConfirmModalOpen}
          onClose={() => {
            setEditConfirmModalOpen(null)
          }}
          onEdit={() => {
            setQuestionData(editConfirmModalOpen)
            setPreferenceDrawerOpen("edit")
          }}
        />
      )}
    </>
  )
}

export default Settings

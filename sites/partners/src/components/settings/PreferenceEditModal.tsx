import React, { useMemo } from "react"
import { MinimalTable, t } from "@bloom-housing/ui-components"
import { Button, Dialog, Link } from "@bloom-housing/ui-seeds"
import { useListingsMultiselectQuestionList } from "../../lib/hooks"
import { MultiselectQuestion } from "@bloom-housing/shared-helpers/src/types/backend-swagger"

type PreferenceEditModalProps = {
  onClose: () => void
  onEdit: () => void
  multiselectQuestion: MultiselectQuestion
}

export const PreferenceEditModal = ({
  multiselectQuestion,
  onClose,
  onEdit,
}: PreferenceEditModalProps) => {
  const { data, loading } = useListingsMultiselectQuestionList(multiselectQuestion.id)

  const listingsTableData = useMemo(
    () =>
      data?.map((listing) => ({
        name: {
          content: <Link href={`/listings/${listing.id}`}>{listing.name}</Link>,
        },
      })),
    [data]
  )

  if (loading) {
    return null
  }

  if (data?.length === 0) {
    onEdit()
    onClose()
    return null
  }

  return (
    <Dialog
      isOpen={!!multiselectQuestion}
      onClose={onClose}
      ariaLabelledBy="preference-changes-modal-header"
      ariaDescribedBy="preference-changes-modal-description"
    >
      <Dialog.Header id="preference-changes-modal-header">
        {t("settings.preferenceChangesRequiredEdit")}
      </Dialog.Header>
      <Dialog.Content>
        <div className="pb-3" id="preference-changes-modal-description">
          {t("settings.preferenceEditError")}
        </div>
        <MinimalTable
          headers={{ name: "listings.listingName" }}
          data={listingsTableData}
          cellClassName={" "}
        />
      </Dialog.Content>
      <Dialog.Footer>
        <Button type="button" variant="primary" onClick={onClose} size="sm">
          {t("t.done")}
        </Button>
      </Dialog.Footer>
    </Dialog>
  )
}

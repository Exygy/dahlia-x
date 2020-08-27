/*
1.2 - Name
Primary applicant details. Name, DOB and Email Address
https://github.com/bloom-housing/bloom/issues/255
*/
import { AlertBox, Button, Field, FormCard, ProgressNav, t } from "@bloom-housing/ui-components"
import FormsLayout from "../../../layouts/forms"
import { useForm } from "react-hook-form"
import { AppSubmissionContext } from "../../../lib/AppSubmissionContext"
import ApplicationConductor from "../../../lib/ApplicationConductor"
import FormStep from "../../../src/forms/applications/FormStep"
import { useContext, useMemo } from "react"
import { emailRegex } from "../../../lib/emailRegex"

export default () => {
  const { conductor, application, listing } = useContext(AppSubmissionContext)
  const currentPageStep = 1

  /* Form Handler */
  const { register, handleSubmit, setValue, watch, errors } = useForm<Record<string, any>>({
    defaultValues: {
      noEmail: application.applicant.noEmail,
    },
  })
  const onSubmit = (data) => {
    new FormStep(conductor).save({ applicant: { ...application.applicant, ...data.applicant } })
    conductor.routeToNextOrReturnUrl("/applications/contact/address")
  }
  const onError = () => {
    //alert("An error occurred, you filthy animal!!!")
    window.scrollTo(0, 0)
  }

  const noEmail = watch("noEmail")

  return (
    <FormsLayout>
      <FormCard header={listing?.name}>
        <ProgressNav
          currentPageStep={currentPageStep}
          completedSteps={application.completedStep}
          labels={["You", "Household", "Income", "Preferences", "Review"]}
        />
      </FormCard>

      <FormCard>
        <div className="form-card__lead border-b">
          <h2 className="form-card__title is-borderless">{t("application.name.title")}</h2>
        </div>

        { 
        
        
        Object.entries(errors).length > 0 && (
        
        <AlertBox 
        type="alert" inverted>
              There are errors you'll need to resolve before moving on.
            </AlertBox>)}
        

        <form className="" onSubmit={handleSubmit(onSubmit, onError)}>
          <div className="form-card__group border-b">
            <label className="field-label--caps" htmlFor="firstName">
              {t("application.name.yourName")}
            </label>

            <Field
              name="applicant.firstName"
              placeholder={t("application.name.firstName")}
              defaultValue={application.applicant.firstName}
              validation={{ required: true }}
              error={errors.applicant?.firstName}
              errorMessage={t("application.name.firstNameError")}
              register={register}
            />

            <Field
              name="applicant.middleName"
              placeholder={t("application.name.middleName")}
              defaultValue={application.applicant.middleName}
              register={register}
            />

            <Field
              name="applicant.lastName"
              placeholder={t("application.name.lastName")}
              defaultValue={application.applicant.lastName}
              validation={{ required: true }}
              error={errors.applicant?.lastName}
              errorMessage={t("application.name.lastNameError")}
              register={register}
            />
          </div>

          <div className="form-card__group border-b">
            <label className="field-label--caps" htmlFor="birthMonth">
              {t("application.name.yourDateOfBirth")}
            </label>

            <div className="field-group--dob">
              <Field
                name="applicant.birthMonth"
                placeholder="MM"
                defaultValue={
                  "" +
                  (application.applicant.birthMonth > 0 ? application.applicant.birthMonth : "")
                }
                error={errors.applicant?.birthMonth}
                validation={{
                  required: true,
                  validate: {
                    monthRange: (value) => parseInt(value) > 0 && parseInt(value) <= 12,
                  },
                }}
                inputProps={{ maxLength: 2 }}
                register={register}
              />
              <Field
                name="applicant.birthDay"
                placeholder="DD"
                defaultValue={
                  "" + (application.applicant.birthDay > 0 ? application.applicant.birthDay : "")
                }
                error={errors.applicant?.birthDay}
                validation={{
                  required: true,
                  validate: {
                    dayRange: (value) => parseInt(value) > 0 && parseInt(value) <= 31,
                  },
                }}
                inputProps={{ maxLength: 2 }}
                register={register}
              />
              <Field
                name="applicant.birthYear"
                placeholder="YYYY"
                defaultValue={
                  "" + (application.applicant.birthYear > 0 ? application.applicant.birthYear : "")
                }
                error={errors.applicant?.birthYear}
                validation={{
                  required: true,
                  validate: {
                    yearRange: (value) =>
                      parseInt(value) > 1900 && parseInt(value) <= new Date().getFullYear() - 18,
                  },
                }}
                inputProps={{ maxLength: 4 }}
                register={register}
              />
            </div>

            {(errors.applicant?.birthMonth ||
              errors.applicant?.birthDay ||
              errors.applicant?.birthYear) && (
              <div className="field error">
                <span className="error-message">{t("application.name.dateOfBirthError")}</span>
              </div>
            )}
          </div>

          <div className="form-card__group">
            <label className="field-label--caps" htmlFor="emailAddress">
              {t("application.name.yourEmailAddress")}
            </label>

            <p className="field-note mb-4">{t("application.name.emailPrivacy")}</p>

            <Field
              type="email"
              name="applicant.emailAddress"
              placeholder={noEmail ? t("t.none") : "example@web.com"}
              defaultValue={application.applicant.emailAddress}
              validation={{ pattern: emailRegex }}
              error={errors.applicant?.emailAddress}
              errorMessage={t("application.name.emailAddressError")}
              register={register}
              disabled={noEmail}
            />

            <div className="field">
              <input
                type="checkbox"
                id="noEmail"
                name="applicant.noEmail"
                defaultChecked={application.applicant.noEmail}
                ref={register}
                onChange={(e) => {
                  if (e.target.checked) {
                    setValue("emailAddress", "")
                  }
                }}
              />
              <label htmlFor="noEmail" className="text-primary font-semibold">
                {t("application.name.noEmailAddress")}
              </label>
            </div>
          </div>

          <div className="form-card__pager">
            <div className="form-card__pager-row primary">
              <Button
                filled={true}
                onClick={() => {
                  conductor.returnToReview = false
                }}
              >
                {t("t.next")}
              </Button>
            </div>

            {conductor.canJumpForwardToReview() && (
              <div className="form-card__pager-row">
                <Button
                  className="button is-unstyled mb-4"
                  onClick={() => {
                    conductor.returnToReview = true
                  }}
                >
                  {t("application.form.general.saveAndReturn")}
                </Button>
              </div>
            )}
          </div>
        </form>
      </FormCard>
    </FormsLayout>
  )
}

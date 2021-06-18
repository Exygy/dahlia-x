import React from "react"
import { t } from "../helpers/translator"
import { Field } from "./Field"
import dayjs from "dayjs"
import customParseFormat from "dayjs/plugin/customParseFormat"
dayjs.extend(customParseFormat)

export type DOBFieldValues = {
  birthDay: string
  birthMonth: string
  birthYear: string
}
export interface DOBFieldProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error?: any
  errorMessage?: string
  label: React.ReactNode
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  watch: any // comes from React Hook Form
  defaultDOB?: DOBFieldValues
  atAge?: boolean
  validateHhAge?: boolean
  name?: string
  id?: string
  required?: boolean
  disabled?: boolean
  readerOnly?: boolean
}

const DOBField = (props: DOBFieldProps) => {
  const { defaultDOB, error, register, watch, atAge, validateHhAge, name, id, errorMessage } = props
  const fieldName = (baseName: string) => {
    return [name, baseName].filter((item) => item).join(".")
  }
  const birthDay = watch(fieldName("birthDay"))
  const birthMonth = watch(fieldName("birthMonth"))
  const validateAge = (value: string) => {
    if (!atAge) return true

    return (
      parseInt(value) > 1900 &&
      dayjs(`${birthMonth}/${birthDay}/${value}`, "MM/DD/YYYY") <
      dayjs().subtract(atAge ? 18 : 0, "years")
    )
  }

  const validateHouseholdMemberAge = (value: string) => {
    const nextYearData = dayjs().add(1, "year")
    const inputDate = dayjs(`${birthMonth}/${birthDay}/${value}`, "MM/DD/YYYY")

    return parseInt(value) > 1900 && inputDate <= nextYearData
  }

  const labelClasses = ["field-label--caps"]
  if (props.readerOnly) labelClasses.push("sr-only")

  return (
    <fieldset id={id}>
      <legend className={labelClasses.join(" ")}>{props.label}</legend>

      <div className="field-group--date">
        <Field
          name={fieldName("birthMonth")}
          label={t("t.month")}
          disabled={props.disabled}
          readerOnly={true}
          placeholder="MM"
          defaultValue={defaultDOB?.birthMonth ? defaultDOB.birthMonth : ""}
          error={error?.birthMonth}
          validation={{
            required: props.required,
            validate: {
              monthRange: (value: string) => {
                if (!props.required && !value?.length) return true

                return parseInt(value) > 0 && parseInt(value) <= 12
              },
            },
          }}
          inputProps={{ maxLength: 2 }}
          register={register}
        />
        <Field
          name={fieldName("birthDay")}
          label={t("t.day")}
          disabled={props.disabled}
          readerOnly={true}
          placeholder="DD"
          defaultValue={defaultDOB?.birthDay ? defaultDOB.birthDay : ""}
          error={error?.birthDay}
          validation={{
            required: props.required,
            validate: {
              dayRange: (value: string) => {
                if (!props.required && !value?.length) return true

                return parseInt(value) > 0 && parseInt(value) <= 31
              },
            },
          }}
          inputProps={{ maxLength: 2 }}
          register={register}
        />
        <Field
          name={fieldName("birthYear")}
          label={t("t.year")}
          disabled={props.disabled}
          readerOnly={true}
          placeholder="YYYY"
          defaultValue={defaultDOB?.birthYear ? defaultDOB.birthYear : ""}
          error={error?.birthYear}
          validation={{
            required: props.required,
            validate: {
              yearRange: (value: string) => {
                if (props.required && value && parseInt(value) < 1900) return false
                if (!props.required && !value?.length) return true

                if (value?.length && validateHhAge) return validateHouseholdMemberAge(value)

                return validateAge(value)
              },
            },
          }}
          inputProps={{ maxLength: 4 }}
          register={register}
        />
      </div>

      {(error?.birthMonth || error?.birthDay || error?.birthYear) && (
        <div className="field error">
          <span id={`${id}-error`} className="error-message">
            {errorMessage ? errorMessage : t("errors.dateOfBirthError")}
          </span>
        </div>
      )}
    </fieldset>
  )
}

export { DOBField as default, DOBField }

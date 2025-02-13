import React from "react"
import { render, fireEvent, waitFor } from "@testing-library/react"
import { useRouter } from "next/router"
import { MessageContext, AuthContext } from "@bloom-housing/shared-helpers"
import { User } from "../../../../shared-helpers/src/types/backend-swagger"
import { SignIn as SignInComponent } from "../../src/pages/sign-in"

const initialStateLoaded = false
let profile: User | undefined

let originalShowPwdless

const TOAST_MESSAGE = {
  toastMessagesRef: { current: [] },
  addToast: jest.fn(),
}

const renderSignInPage = () =>
  render(
    <MessageContext.Provider value={TOAST_MESSAGE}>
      <SignInComponent />
    </MessageContext.Provider>
  )

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}))

beforeAll(() => {
  window.scrollTo = jest.fn()
})

describe("Sign In Page", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue("")
  })

  it("renders all page elements including fields, buttons and links", () => {
    const { getByText, getByTestId, getByLabelText, getByRole } = renderSignInPage()

    expect(getByText("Sign In", { selector: "h1" })).toBeInTheDocument()
    expect(getByLabelText("Email")).toBeInTheDocument()
    expect(getByTestId("sign-in-email-field")).toBeInTheDocument()
    expect(getByLabelText("Password")).toBeInTheDocument()
    expect(getByTestId("sign-in-password-field")).toBeInTheDocument()
    expect(getByRole("link", { name: /forgot password/i })).toBeInTheDocument()
    expect(getByRole("button", { name: /sign in/i })).toBeInTheDocument()

    expect(getByText("Don't have an account?", { selector: "h2" })).toBeInTheDocument()
    expect(getByRole("link", { name: /create account/i })).toBeInTheDocument()
  })

  describe("Field validation errors", () => {
    it("show error alert and password validation error when clicking 'Sign in' button without filling out password", async () => {
      const { findByText, getByRole, getByLabelText } = renderSignInPage()

      fireEvent.change(getByLabelText("Email"), { target: { value: "admin@example.com" } })

      fireEvent.click(getByRole("button", { name: /sign in/i }))
      expect(
        await findByText("There are errors you'll need to resolve before moving on.")
      ).toBeInTheDocument()
      expect(await findByText("Please enter your login password")).toBeInTheDocument()
    })

    it("shows error alert and  email validation error when clicking 'Sign in' button without filling out email address", async () => {
      const { findByText, getByRole, getByLabelText } = renderSignInPage()

      fireEvent.change(getByLabelText("Password"), { target: { value: "abcdef" } })

      fireEvent.click(getByRole("button", { name: /sign in/i }))
      expect(
        await findByText("There are errors you'll need to resolve before moving on.")
      ).toBeInTheDocument()
      expect(await findByText("Please enter your login email")).toBeInTheDocument()
    })

    it("shows error alert and both field validation errors when clicking 'Sign in' button without filling out fields", async () => {
      const { findByText, getByRole } = renderSignInPage()

      fireEvent.click(getByRole("button", { name: /sign in/i }))
      expect(
        await findByText("There are errors you'll need to resolve before moving on.")
      ).toBeInTheDocument()
      expect(await findByText("Please enter your login email")).toBeInTheDocument()
      expect(await findByText("Please enter your login password")).toBeInTheDocument()
    })

    it("should not show errors on render", () => {
      const { queryByText } = renderSignInPage()

      expect(
        queryByText("There are errors you'll need to resolve before moving on.")
      ).not.toBeInTheDocument()
      expect(queryByText("Please enter your login email")).not.toBeInTheDocument()
      expect(queryByText("Please enter your login password")).not.toBeInTheDocument()
    })
  })

  describe("User not logged in", () => {
    it("shows the sign-in form", () => {
      const { getByLabelText, getByText } = render(
        <AuthContext.Provider value={{ initialStateLoaded, profile }}>
          <MessageContext.Provider value={TOAST_MESSAGE}>
            <SignInComponent />
          </MessageContext.Provider>
        </AuthContext.Provider>
      )
      expect(getByText("Sign In", { selector: "h1" })).toBeInTheDocument()
      expect(getByLabelText("Email")).toBeInTheDocument()
      expect(getByLabelText("Password")).toBeInTheDocument()
    })
  })
})

describe("Passwordless Sign In page", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue("")
  })

  const renderSignInPage = () =>
    render(
      <MessageContext.Provider value={TOAST_MESSAGE}>
        <SignInComponent />
      </MessageContext.Provider>
    )

  beforeEach(() => {
    originalShowPwdless = process.env.showPwdless
    process.env.showPwdless = "TRUE"
  })

  afterEach(() => {
    process.env.showPwdless = originalShowPwdless
  })

  it("renders all page elements including fields, buttons and links", () => {
    const { getByText, getByLabelText, getByTestId, getByRole } = renderSignInPage()

    expect(getByText("Sign In", { selector: "h1" })).toBeInTheDocument()
    expect(
      getByText("Enter your email and we'll send you a code to sign in.", { selector: "p" })
    ).toBeInTheDocument()
    expect(getByLabelText("Email")).toBeInTheDocument()
    expect(getByTestId("sign-in-email-field")).toBeInTheDocument()

    expect(getByRole("button", { name: "Get code to sign in" })).toBeInTheDocument()
    expect(getByRole("button", { name: "Use your password instead" })).toBeInTheDocument()

    expect(getByText("Don't have an account?", { selector: "h2" })).toBeInTheDocument()
    expect(
      getByText("Sign up quickly with no need to remember any passwords.", { selector: "div" })
    ).toBeInTheDocument()
    expect(getByRole("link", { name: /create account/i })).toBeInTheDocument()
  })

  it("shows error alert and email validation error after clicking 'Get code to sign in' button without filling out email field", async () => {
    const { findByText, getByRole } = renderSignInPage()

    fireEvent.click(getByRole("button", { name: "Get code to sign in" }))
    expect(
      await findByText("There are errors you'll need to resolve before moving on.")
    ).toBeInTheDocument()
    expect(await findByText("Please enter your login email")).toBeInTheDocument()
  })

  it("shows correct page elements after clicking 'Use your password instead' button", async () => {
    const { getByRole, getByLabelText, getByTestId } = renderSignInPage()

    fireEvent.click(getByRole("button", { name: "Use your password instead" }))

    await waitFor(() => {
      expect(getByLabelText("Email")).toBeInTheDocument()
      expect(getByTestId("sign-in-email-field")).toBeInTheDocument()
      expect(getByLabelText("Password")).toBeInTheDocument()
      expect(getByTestId("sign-in-password-field")).toBeInTheDocument()
      expect(getByRole("button", { name: "Get a code instead" })).toBeInTheDocument()
    })
  })

  it("shows correct page elements after clicking 'Use your password instead' button and then clicking 'Get a code instead' button", async () => {
    const { findByRole, getByRole, getByLabelText, getByTestId, queryByLabelText, queryByTestId } =
      renderSignInPage()

    fireEvent.click(getByRole("button", { name: "Use your password instead" }))
    expect(await findByRole("button", { name: "Get a code instead" })).toBeInTheDocument()

    fireEvent.click(getByRole("button", { name: "Get a code instead" }))

    await waitFor(() => {
      expect(getByLabelText("Email")).toBeInTheDocument()
      expect(getByTestId("sign-in-email-field")).toBeInTheDocument()
      expect(queryByLabelText("Password")).not.toBeInTheDocument()
      expect(queryByTestId("sign-in-password-field")).not.toBeInTheDocument()
      expect(getByRole("button", { name: "Use your password instead" })).toBeInTheDocument()
    })
  })
})

describe("Mandated accounts", () => {
  it.todo("Desktop test(s)")
  it.todo("Mobile test(s)")
})

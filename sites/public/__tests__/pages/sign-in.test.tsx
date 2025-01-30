import React from "react"
import { render, fireEvent } from "@testing-library/react"
import { useRouter } from "next/router"
import { MessageContext, AuthContext } from "@bloom-housing/shared-helpers"
import { GenericRouter } from "@bloom-housing/ui-components"
import { User } from "../../../../shared-helpers/src/types/backend-swagger"

import SignIn from "../../src/pages/sign-in"

const mockRouter: GenericRouter = {
  pathname: "",
  asPath: "",
  back: jest.fn(),
  push(url: string) {
    this.pathname = url
    this.asPath = url
  },
}

let initialStateLoaded = false
let profile: User | undefined

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}))

beforeAll(() => {
  window.scrollTo = jest.fn()
})

describe("Sign In Page", () => {
  let mockMessageContext: {
    toastMessagesRef: {
      current: unknown[]
    }
    addToast: () => void
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockRouter.push("")
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)

    mockMessageContext = {
      toastMessagesRef: { current: [] },
      addToast: jest.fn(),
    }
  })

  const renderSignInPage = () =>
    render(
      <MessageContext.Provider value={mockMessageContext}>
        <SignIn />
      </MessageContext.Provider>
    )

  it("renders all page elements including fields, buttons and links", () => {
    const { getByText, getByLabelText, getByRole } = renderSignInPage()

    expect(getByText("Sign In", { selector: "h1" })).toBeInTheDocument()
    expect(getByLabelText("Email")).toBeInTheDocument()
    expect(getByLabelText("Password")).toBeInTheDocument()
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
    beforeEach(() => {
      initialStateLoaded = true
      profile = undefined
    })

    it("shows the sign-in form", () => {
      const { getByLabelText, getByText } = render(
        <AuthContext.Provider value={{ initialStateLoaded, profile }}>
          <MessageContext.Provider value={mockMessageContext}>
            <SignIn />
          </MessageContext.Provider>
        </AuthContext.Provider>
      )
      expect(getByText("Sign In", { selector: "h1" })).toBeInTheDocument()
      expect(getByLabelText(/email/i)).toBeInTheDocument()
      expect(getByLabelText(/password/i)).toBeInTheDocument()
    })
  })

  describe("User logged in", () => {
    const mockUser: User = {
      id: "123",
      email: "test@test.com",
      firstName: "Test",
      lastName: "User",
      dob: new Date("2020-01-01"),
      createdAt: new Date("2020-01-01"),
      updatedAt: new Date("2020-01-01"),
      jurisdictions: [],
      mfaEnabled: false,
      passwordUpdatedAt: new Date("2020-01-01"),
      passwordValidForDays: 180,
      agreedToTermsOfService: true,
      listings: [],
    }

    beforeEach(() => {
      initialStateLoaded = true
      profile = mockUser
    })

    it("redirects to the account dashboard page", () => {
      render(
        <AuthContext.Provider value={{ initialStateLoaded, profile }}>
          <MessageContext.Provider value={mockMessageContext}>
            <SignIn />
          </MessageContext.Provider>
        </AuthContext.Provider>
      )

      expect(mockRouter.pathname).toEqual("/account/dashboard")
    })
  })
})

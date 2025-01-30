import React from "react"
import { render, fireEvent } from "@testing-library/react"
import { useRouter } from "next/router"
import { MessageContext } from "@bloom-housing/shared-helpers"
import { GenericRouter } from "@bloom-housing/ui-components"

import SignIn from "../../src/pages/sign-in"

// not sure if i need mockRouter.push() yet
const mockRouter: GenericRouter = {
  pathname: "",
  asPath: "",
  back: jest.fn(),
  push(url: string) {
    this.pathname = url
    this.asPath = url
  },
}

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}))

beforeAll(() => {
  window.scrollTo = jest.fn()
})

describe("SignIn Page", () => {
  let mockMessageContext: any

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

  it("renders all fields, buttons and links", () => {
    const { getByText, getByLabelText, getByRole } = renderSignInPage()

    expect(getByLabelText("Email")).toBeInTheDocument()
    expect(getByLabelText("Password")).toBeInTheDocument()
    expect(getByRole("link", { name: /forgot password/i })).toBeInTheDocument()
    expect(getByRole("button", { name: /sign in/i })).toBeInTheDocument()

    expect(getByText("Don't have an account?")).toBeInTheDocument()
    expect(getByRole("link", { name: /create account/i })).toBeInTheDocument()
  })

  it("shows both validation errors when clicking 'Sign in' button without filling out fields", async () => {
    const { findByText, getByRole } = renderSignInPage()

    fireEvent.click(getByRole("button", { name: /sign in/i }))
    expect(await findByText("Please enter your login email")).toBeInTheDocument()
    expect(await findByText("Please enter your login password")).toBeInTheDocument()
  })
})

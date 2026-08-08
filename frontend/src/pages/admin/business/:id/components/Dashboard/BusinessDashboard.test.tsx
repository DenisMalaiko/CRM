import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { Provider } from "react-redux"
import { configureStore } from "@reduxjs/toolkit"
import BusinessDashboard from "./BusinessDashboard"

const mockGetProducts = jest.fn().mockReturnValue({ unwrap: () => Promise.resolve({ data: [{ id: "1", name: "Product 1" }] }) })
const mockGetAudiences = jest.fn().mockReturnValue({ unwrap: () => Promise.resolve({ data: [{ id: "1", name: "Audience 1" }] }) })
const mockGetProfiles = jest.fn().mockReturnValue({ unwrap: () => Promise.resolve({ data: [{ id: "1", name: "Profile 1", createdAt: "2026-08-01T00:00:00Z" }] }) })
const mockGetPrompts = jest.fn().mockReturnValue({ unwrap: () => Promise.resolve({ data: [{ id: "1", name: "Prompt 1", createdAt: "2026-08-02T00:00:00Z" }] }) })
const mockGetContentPlans = jest.fn().mockReturnValue({ unwrap: () => Promise.resolve({ data: [{ id: "1", title: "Plan 1", createdAt: "2026-08-03T00:00:00Z" }] }) })
const mockGetIdeasAI = jest.fn().mockReturnValue({ unwrap: () => Promise.resolve({ data: [{ id: "1", title: "Idea 1", createdAt: "2026-08-04T00:00:00Z" }] }) })

jest.mock("../../../../../../store/products/productsApi", () => ({
  useGetProductsMutation: () => [mockGetProducts, { isLoading: false }],
}))
jest.mock("../../../../../../store/audience/audienceApi", () => ({
  useGetAudiencesMutation: () => [mockGetAudiences, { isLoading: false }],
}))
jest.mock("../../../../../../store/profile/profileApi", () => ({
  useGetProfilesMutation: () => [mockGetProfiles, { isLoading: false }],
}))
jest.mock("../../../../../../store/prompts/promptApi", () => ({
  useGetPromptsMutation: () => [mockGetPrompts, { isLoading: false }],
}))
jest.mock("../../../../../../store/contentPlan/contentPlanApi", () => ({
  useLazyGetContentPlansQuery: () => [mockGetContentPlans, { isLoading: false }],
}))
jest.mock("../../../../../../store/ai/ideas/ideaAiApi", () => ({
  useLazyGetIdeasAIQuery: () => [mockGetIdeasAI, { isLoading: false }],
}))

const mockStore = configureStore({
  reducer: {
    productsModule: () => ({ products: [{ id: "1", name: "Product 1" }] }),
    audienceModule: () => ({ audiences: [{ id: "1", name: "Audience 1" }] }),
    profileModule: () => ({ profiles: [{ id: "1", name: "Profile 1", createdAt: "2026-08-01T00:00:00Z" }] }),
    promptModule: () => ({ prompts: [{ id: "1", name: "Prompt 1", createdAt: "2026-08-02T00:00:00Z" }] }),
    contentPlanModule: () => ({ contentPlans: [{ id: "1", title: "Plan 1", createdAt: "2026-08-03T00:00:00Z" }] }),
    ideaAiModule: () => ({ ideasAi: [{ id: "1", title: "Idea 1", createdAt: "2026-08-04T00:00:00Z" }] }),
  },
})

function renderDashboard() {
  return render(
    <Provider store={mockStore}>
      <MemoryRouter initialEntries={["/profile/businesses/test-id/dashboard"]}>
        <Routes>
          <Route path="/profile/businesses/:businessId/dashboard" element={<BusinessDashboard />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  )
}

describe("BusinessDashboard", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetProducts.mockReturnValue({ unwrap: () => Promise.resolve({ data: [{ id: "1", name: "Product 1" }] }) })
    mockGetAudiences.mockReturnValue({ unwrap: () => Promise.resolve({ data: [{ id: "1", name: "Audience 1" }] }) })
    mockGetProfiles.mockReturnValue({ unwrap: () => Promise.resolve({ data: [{ id: "1", name: "Profile 1", createdAt: "2026-08-01T00:00:00Z" }] }) })
    mockGetPrompts.mockReturnValue({ unwrap: () => Promise.resolve({ data: [{ id: "1", name: "Prompt 1", createdAt: "2026-08-02T00:00:00Z" }] }) })
    mockGetContentPlans.mockReturnValue({ unwrap: () => Promise.resolve({ data: [{ id: "1", title: "Plan 1", createdAt: "2026-08-03T00:00:00Z" }] }) })
    mockGetIdeasAI.mockReturnValue({ unwrap: () => Promise.resolve({ data: [{ id: "1", title: "Idea 1", createdAt: "2026-08-04T00:00:00Z" }] }) })
  })

  it("renders stat cards with correct counts", () => {
    renderDashboard()

    expect(screen.getByText("Products")).toBeInTheDocument()
    expect(screen.getByText("Audiences")).toBeInTheDocument()
    expect(screen.getByText("Profiles")).toBeInTheDocument()
    expect(screen.getByText("Prompts")).toBeInTheDocument()
    expect(screen.getByText("Content Plans")).toBeInTheDocument()
    expect(screen.getByText("AI Ideas")).toBeInTheDocument()
  })

  it("renders stat card count values", () => {
    renderDashboard()

    const ones = screen.getAllByText("1")
    expect(ones.length).toBeGreaterThanOrEqual(6)
  })

  it("renders the Recent Activity section", () => {
    renderDashboard()

    expect(screen.getByText("Recent Activity")).toBeInTheDocument()
  })

  it("renders activity items from models with createdAt", () => {
    renderDashboard()

    expect(screen.getByText("Idea 1")).toBeInTheDocument()
    expect(screen.getByText("Plan 1")).toBeInTheDocument()
    expect(screen.getByText("Prompt 1")).toBeInTheDocument()
    expect(screen.getByText("Profile 1")).toBeInTheDocument()
  })

  it("calls mutation hooks on mount with businessId", async () => {
    renderDashboard()

    await waitFor(() => {
      expect(mockGetProducts).toHaveBeenCalledWith("test-id")
      expect(mockGetAudiences).toHaveBeenCalledWith("test-id")
      expect(mockGetProfiles).toHaveBeenCalledWith("test-id")
      expect(mockGetPrompts).toHaveBeenCalledWith("test-id")
    })
  })
})

import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { Provider } from "react-redux"
import { configureStore } from "@reduxjs/toolkit"
import { BusinessDashboard } from "./BusinessDashboard"

const mockGetProducts = jest.fn().mockReturnValue({ unwrap: () => Promise.resolve({ data: [{ id: "1", name: "Product 1" }] }) })
const mockGetAudiences = jest.fn().mockReturnValue({ unwrap: () => Promise.resolve({ data: [{ id: "1", name: "Audience 1" }] }) })
const mockGetProfiles = jest.fn().mockReturnValue({ unwrap: () => Promise.resolve({ data: [{ id: "1", name: "Profile 1", createdAt: "2026-08-01T00:00:00Z" }] }) })
const mockGetPrompts = jest.fn().mockReturnValue({ unwrap: () => Promise.resolve({ data: [{ id: "1", name: "Prompt 1", createdAt: "2026-08-02T00:00:00Z" }] }) })
const mockGetContentPlans = jest.fn().mockReturnValue({ unwrap: () => Promise.resolve({ data: [{ id: "1", title: "Plan 1", createdAt: "2026-08-03T00:00:00Z" }] }) })
const mockGetIdeasAI = jest.fn().mockReturnValue({ unwrap: () => Promise.resolve({ data: [{ id: "1", title: "Idea 1", createdAt: "2026-08-04T00:00:00Z" }] }) })
const mockGetCompetitors = jest.fn().mockReturnValue({ unwrap: () => Promise.resolve({ data: [] }) })
const mockFetchCompetitorInstagramReport = jest.fn().mockReturnValue({ unwrap: () => Promise.resolve({}) })
const mockFetchFacebookReport = jest.fn().mockReturnValue({ unwrap: () => Promise.resolve(null) })
const mockFetchInstagramReport = jest.fn().mockReturnValue({ unwrap: () => Promise.resolve(null) })

jest.mock("../../../../../store/products/productsApi", () => ({
  useGetProductsMutation: () => [mockGetProducts, { isLoading: false }],
}))
jest.mock("../../../../../store/audience/audienceApi", () => ({
  useGetAudiencesMutation: () => [mockGetAudiences, { isLoading: false }],
}))
jest.mock("../../../../../store/profile/profileApi", () => ({
  useGetProfilesMutation: () => [mockGetProfiles, { isLoading: false }],
}))
jest.mock("../../../../../store/prompts/promptApi", () => ({
  useGetPromptsMutation: () => [mockGetPrompts, { isLoading: false }],
}))
jest.mock("../../../../../store/contentPlan/contentPlanApi", () => ({
  useLazyGetContentPlansQuery: () => [mockGetContentPlans, { isLoading: false }],
}))
jest.mock("../../../../../store/ai/ideas/ideaAiApi", () => ({
  useLazyGetIdeasAIQuery: () => [mockGetIdeasAI, { isLoading: false }],
}))
jest.mock("../../../../../store/businesses/businessesApi", () => ({
  useGetFacebookReportMutation: () => [jest.fn().mockReturnValue({ unwrap: () => Promise.resolve(null) }), { isLoading: false }],
  useGetInstagramReportMutation: () => [jest.fn().mockReturnValue({ unwrap: () => Promise.resolve(null) }), { isLoading: false }],
  useFetchInstagramReportMutation: () => [mockFetchInstagramReport, { isLoading: false }],
  useFetchFacebookReportMutation: () => [mockFetchFacebookReport, { isLoading: false }],
}))
jest.mock("../../../../../store/competitor/competitorApi", () => ({
  useGetCompetitorsMutation: () => [mockGetCompetitors, { isLoading: false }],
  useFetchCompetitorInstagramReportMutation: () => [mockFetchCompetitorInstagramReport, { isLoading: false }],
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
    mockGetCompetitors.mockReturnValue({ unwrap: () => Promise.resolve({ data: [] }) })
    mockFetchCompetitorInstagramReport.mockReturnValue({ unwrap: () => Promise.resolve({}) })
    mockFetchFacebookReport.mockReturnValue({ unwrap: () => Promise.resolve(null) })
    mockFetchInstagramReport.mockReturnValue({ unwrap: () => Promise.resolve(null) })
  })

  it("calls mutation hooks on mount with businessId", async () => {
    renderDashboard()

    await waitFor(() => expect(mockGetProducts).toHaveBeenCalledWith("test-id"))
    await waitFor(() => expect(mockGetAudiences).toHaveBeenCalledWith("test-id"))
    await waitFor(() => expect(mockGetProfiles).toHaveBeenCalledWith("test-id"))
    await waitFor(() => expect(mockGetPrompts).toHaveBeenCalledWith("test-id"))
  })

  describe("General tab", () => {
    it("is the default active tab", () => {
      renderDashboard()

      expect(screen.getByText("Products")).toBeInTheDocument()
      expect(screen.getByText("Recent Activity")).toBeInTheDocument()
    })

    it("renders stat cards for Products, Audiences, and AI Ideas", () => {
      renderDashboard()

      expect(screen.getByText("Products")).toBeInTheDocument()
      expect(screen.getByText("Audiences")).toBeInTheDocument()
      expect(screen.getByText("AI Ideas")).toBeInTheDocument()
    })

    it("renders activity items from profiles, prompts, content plans, and AI ideas", () => {
      renderDashboard()

      expect(screen.getByText("Profile 1")).toBeInTheDocument()
      expect(screen.getByText("Prompt 1")).toBeInTheDocument()
      expect(screen.getByText("Plan 1")).toBeInTheDocument()
      expect(screen.getByText("Idea 1")).toBeInTheDocument()
    })

    it("shows empty state message when there is no recent activity", () => {
      const emptyStore = configureStore({
        reducer: {
          productsModule: () => ({ products: [] }),
          audienceModule: () => ({ audiences: [] }),
          profileModule: () => ({ profiles: [] }),
          promptModule: () => ({ prompts: [] }),
          contentPlanModule: () => ({ contentPlans: [] }),
          ideaAiModule: () => ({ ideasAi: [] }),
        },
      })

      render(
        <Provider store={emptyStore}>
          <MemoryRouter initialEntries={["/profile/businesses/test-id/dashboard"]}>
            <Routes>
              <Route path="/profile/businesses/:businessId/dashboard" element={<BusinessDashboard />} />
            </Routes>
          </MemoryRouter>
        </Provider>
      )

      expect(screen.getByText("No recent activity")).toBeInTheDocument()
    })
  })

  describe("tabs", () => {
    it("renders all three tab buttons", () => {
      renderDashboard()

      expect(screen.getByRole("button", { name: "General" })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Facebook" })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Instagram" })).toBeInTheDocument()
    })

    it("hides General content when Facebook tab is clicked", () => {
      renderDashboard()

      userEvent.click(screen.getByRole("button", { name: "Facebook" }))

      expect(screen.queryByText("Recent Activity")).not.toBeInTheDocument()
      expect(screen.queryByText("AI Ideas")).not.toBeInTheDocument()
    })

    it("hides General content when Instagram tab is clicked", () => {
      renderDashboard()

      userEvent.click(screen.getByRole("button", { name: "Instagram" }))

      expect(screen.queryByText("Recent Activity")).not.toBeInTheDocument()
      expect(screen.queryByText("AI Ideas")).not.toBeInTheDocument()
    })

    it("returns to General content after switching back from Facebook", () => {
      renderDashboard()

      userEvent.click(screen.getByRole("button", { name: "Facebook" }))
      userEvent.click(screen.getByRole("button", { name: "General" }))

      expect(screen.getByText("Products")).toBeInTheDocument()
      expect(screen.getByText("Recent Activity")).toBeInTheDocument()
    })
  })

  describe("Facebook tab", () => {
    it("shows Followers, Posts and Active Ads stat cards", () => {
      renderDashboard()

      userEvent.click(screen.getByRole("button", { name: "Facebook" }))

      expect(screen.getByText("Followers")).toBeInTheDocument()
      expect(screen.getByText("Posts")).toBeInTheDocument()
      expect(screen.getByText("Active Ads")).toBeInTheDocument()
    })

    it("shows zero counts when there is no facebook report", () => {
      renderDashboard()

      userEvent.click(screen.getByRole("button", { name: "Facebook" }))

      const zeros = screen.getAllByText("0")
      expect(zeros.length).toBeGreaterThanOrEqual(3)
    })

    it("renders the Fetch Facebook Data button", () => {
      renderDashboard()

      userEvent.click(screen.getByRole("button", { name: "Facebook" }))

      expect(screen.getByRole("button", { name: "Fetch Facebook Data" })).toBeInTheDocument()
    })

    it("renders ContentTypeChart heading on the Facebook tab", () => {
      renderDashboard()

      userEvent.click(screen.getByRole("button", { name: "Facebook" }))

      expect(screen.getByText("Posts Formats (90D)")).toBeInTheDocument()
    })

    it("shows 'No data yet' in all charts when facebook report is absent", () => {
      renderDashboard()

      userEvent.click(screen.getByRole("button", { name: "Facebook" }))

      // ContentTypeChart, AdsFormatChart, and AdsCtaChart all render "No data yet"
      const noDataMessages = screen.getAllByText("No data yet")
      expect(noDataMessages).toHaveLength(3)
    })

    it("renders AdsFormatChart heading on the Facebook tab", () => {
      renderDashboard()

      userEvent.click(screen.getByRole("button", { name: "Facebook" }))

      expect(screen.getByText("Ads Formats")).toBeInTheDocument()
    })

    it("renders AdsCtaChart heading on the Facebook tab", () => {
      renderDashboard()

      userEvent.click(screen.getByRole("button", { name: "Facebook" }))

      expect(screen.getByText("Ads CTA Types")).toBeInTheDocument()
    })
  })

  describe("Instagram tab", () => {
    it("shows Followers, Posts, Reels and Stories stat cards", () => {
      renderDashboard()

      userEvent.click(screen.getByRole("button", { name: "Instagram" }))

      expect(screen.getByText("Followers")).toBeInTheDocument()
      expect(screen.getByText("Posts")).toBeInTheDocument()
      expect(screen.getByText("Reels")).toBeInTheDocument()
      expect(screen.getByText("Stories")).toBeInTheDocument()
    })

    it("renders the ContentTypeChart on the Instagram tab", () => {
      renderDashboard()

      userEvent.click(screen.getByRole("button", { name: "Instagram" }))

      expect(screen.getByText("Posts Formats (90D)")).toBeInTheDocument()
    })

    it("renders the Strategic Insights section", () => {
      renderDashboard()

      userEvent.click(screen.getByRole("button", { name: "Instagram" }))

      expect(screen.getByText("Strategic Insights")).toBeInTheDocument()
    })

    it("shows empty state when there are no competitors", async () => {
      renderDashboard()

      userEvent.click(screen.getByRole("button", { name: "Instagram" }))

      expect(await screen.findByText("No competitors added")).toBeInTheDocument()
    })
  })

  describe("competitors table", () => {
    const competitorWithLink = {
      id: "comp-1",
      name: "Acme Corp",
      instagramLink: "https://instagram.com/acmecorp",
      instagramReport: { followers: 1200, posts: 30, reels: 5, stories: 10 },
    }

    beforeEach(() => {
      mockGetCompetitors.mockReturnValue({
        unwrap: () => Promise.resolve({ data: [competitorWithLink] }),
      })
    })

    it("renders competitor name in the table", async () => {
      renderDashboard()

      userEvent.click(screen.getByRole("button", { name: "Instagram" }))

      expect(await screen.findByText("Acme Corp")).toBeInTheDocument()
    })

    it("displays competitor stats from instagramReport", async () => {
      renderDashboard()

      userEvent.click(screen.getByRole("button", { name: "Instagram" }))

      await screen.findByText("Acme Corp")
      expect(screen.getByText("1200")).toBeInTheDocument()
      expect(screen.getByText("30")).toBeInTheDocument()
      expect(screen.getByText("5")).toBeInTheDocument()
      expect(screen.getByText("10")).toBeInTheDocument()
    })

    it("opens competitor Instagram profile in a new tab when the row is clicked", async () => {
      const openSpy = jest.spyOn(window, "open").mockImplementation(() => null)
      renderDashboard()

      userEvent.click(screen.getByRole("button", { name: "Instagram" }))

      const competitorName = await screen.findByText("Acme Corp")
      userEvent.click(competitorName.closest("tr")!)

      expect(openSpy).toHaveBeenCalledWith(
        "https://instagram.com/acmecorp",
        "_blank",
        "noopener,noreferrer"
      )

      openSpy.mockRestore()
    })
  })
})

import React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { NicheNewsBlock } from "./NicheNewsBlock"
import { TNicheNews } from "../../../models/NicheNews"
import { TIdeaAI } from "../../../models/IdeaAI"
import { IdeaStatus } from "../../../enum/IdeaStatus"

// ---------------------------------------------------------------------------
// IdeaDetailDlg (standalone)
// ---------------------------------------------------------------------------

import { IdeaDetailDlg } from "./components/ideaDetailDlg/IdeaDetailDlg"

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "BusinessDashboard.nicheNews": "Niche News",
        "BusinessDashboard.noNicheNewsYet": "No niche news yet",
        "BusinessDashboard.fetching": "Fetching...",
        "BusinessDashboard.fetchNews": "Fetch News",
        "BusinessDashboard.ideaWho": "Who",
        "BusinessDashboard.ideaWhat": "What",
        "BusinessDashboard.ideaWhy": "Why",
        "BusinessDashboard.ideaHow": "How",
        "BusinessDashboard.ideaFeeling": "Feeling",
        "BusinessDashboard.ideaWhoValue_Person": "Person",
        "BusinessDashboard.ideaWhatValue_Story": "Story",
        "BusinessDashboard.ideaWhyValue_Inspire": "Inspire",
        "BusinessDashboard.ideaHowValue_Storytelling": "Storytelling",
        "BusinessDashboard.ideaFeelingValue_Excitement": "Excitement",
      }
      return translations[key] ?? key
    },
  }),
}))


// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const baseItem: TNicheNews = {
  id: "1",
  agencyId: "agency-1",
  title: "AI Takes Over Marketing",
  summary: "A detailed look at how AI is reshaping digital marketing strategies worldwide.",
  url: "https://example.com/ai-marketing",
  source: "TechCrunch",
  industry: "Technology",
  publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
}

const secondItem: TNicheNews = {
  id: "2",
  agencyId: "agency-1",
  title: "Social Commerce Growth in 2026",
  summary: "Brands are doubling down on social commerce as conversion rates improve.",
  url: "https://example.com/social-commerce",
  source: "Forbes",
  industry: "E-commerce",
  publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
}

const mockIdea: TIdeaAI = {
  id: "idea-42",
  businessId: "biz-1",
  title: "Leverage AI for email campaigns",
  description: "Use generative AI to personalise every email send.",
  who: "Person",
  what: "Story",
  why: "Inspire",
  how: "Storytelling",
  feeling: "Excitement",
  createdAt: new Date("2026-01-01"),
  status: IdeaStatus.New,
}

const itemWithIdea: TNicheNews = {
  ...baseItem,
  id: "3",
  ideasAI: [mockIdea],
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeItems(count: number): TNicheNews[] {
  return Array.from({ length: count }, (_, i) => ({
    id: String(i + 1),
    agencyId: "agency-1",
    title: `Article ${i + 1}`,
    summary: `Summary ${i + 1}`,
    url: `https://example.com/article-${i + 1}`,
    source: "Source",
    industry: "Tech",
    publishedAt: new Date(2026, 0, i + 1).toISOString(),
  }))
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  jest.clearAllMocks()
  jest.spyOn(window, "open").mockImplementation(() => null)
})

afterEach(() => {
  jest.restoreAllMocks()
})

describe("NicheNewsBlock", () => {
  describe("heading", () => {
    it("always renders the Niche News heading", () => {
      render(<NicheNewsBlock nicheNews={[]} />)

      expect(screen.getByRole("heading", { name: "Niche News" })).toBeInTheDocument()
    })
  })

  describe("empty state", () => {
    it("shows empty state message when nicheNews array is empty", () => {
      render(<NicheNewsBlock nicheNews={[]} />)

      expect(screen.getByText("No niche news yet")).toBeInTheDocument()
    })

    it("does not show news items when the array is empty", () => {
      render(<NicheNewsBlock nicheNews={[]} />)

      expect(screen.queryByRole("button", { name: /prev/i })).not.toBeInTheDocument()
    })
  })

  describe("news list", () => {
    it("does not show the empty state message when items are present", () => {
      render(<NicheNewsBlock nicheNews={[baseItem]} />)

      expect(screen.queryByText("No niche news yet")).not.toBeInTheDocument()
    })

    it("renders the title of each news item", () => {
      render(<NicheNewsBlock nicheNews={[baseItem, secondItem]} />)

      expect(screen.getByText("AI Takes Over Marketing")).toBeInTheDocument()
      expect(screen.getByText("Social Commerce Growth in 2026")).toBeInTheDocument()
    })

    it("renders the summary of each news item", () => {
      render(<NicheNewsBlock nicheNews={[baseItem, secondItem]} />)

      expect(
        screen.getByText(
          "A detailed look at how AI is reshaping digital marketing strategies worldwide."
        )
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          "Brands are doubling down on social commerce as conversion rates improve."
        )
      ).toBeInTheDocument()
    })

    it("renders source and industry for each item", () => {
      render(<NicheNewsBlock nicheNews={[baseItem]} />)

      expect(screen.getByText(/TechCrunch/)).toBeInTheDocument()
      expect(screen.getByText(/Technology/)).toBeInTheDocument()
    })

    it("renders a relative date for each item", () => {
      render(<NicheNewsBlock nicheNews={[baseItem]} />)

      expect(screen.getByText(/ago/)).toBeInTheDocument()
    })
  })

  describe("news item click — opens URL", () => {
    it("calls window.open with the item URL when a news row is clicked", () => {
      render(<NicheNewsBlock nicheNews={[baseItem]} />)

      userEvent.click(screen.getByText("AI Takes Over Marketing"))

      expect(window.open).toHaveBeenCalledWith(
        "https://example.com/ai-marketing",
        "_blank",
        "noopener,noreferrer"
      )
    })
  })

  describe("idea button", () => {
    it("is not rendered when a news item has no ideasAI", () => {
      render(<NicheNewsBlock nicheNews={[baseItem]} />)

      expect(screen.queryByRole("button", { name: /💡/u })).not.toBeInTheDocument()
    })

    it("is rendered when a news item has an associated idea", () => {
      render(<NicheNewsBlock nicheNews={[itemWithIdea]} />)

      expect(
        screen.getByRole("button", { name: /Leverage AI for email campaigns/i })
      ).toBeInTheDocument()
    })

    it("does NOT open the news URL when the idea button is clicked", () => {
      render(<NicheNewsBlock nicheNews={[itemWithIdea]} />)

      userEvent.click(
        screen.getByRole("button", { name: /Leverage AI for email campaigns/i })
      )

      expect(window.open).not.toHaveBeenCalled()
    })

    it("opens the IdeaDetailDlg when the idea button is clicked", () => {
      render(<NicheNewsBlock nicheNews={[itemWithIdea]} />)

      userEvent.click(
        screen.getByRole("button", { name: /Leverage AI for email campaigns/i })
      )

      expect(screen.getByText("Use generative AI to personalise every email send.")).toBeInTheDocument()
    })
  })

  describe("sorting", () => {
    it("renders the newest item first regardless of input order", () => {
      const oldest: TNicheNews = {
        id: "old",
        agencyId: "agency-1",
        title: "Oldest Article",
        summary: "This is the oldest.",
        url: "https://example.com/oldest",
        source: "OldSource",
        industry: "Tech",
        publishedAt: new Date("2024-01-01T00:00:00Z").toISOString(),
      }
      const middle: TNicheNews = {
        id: "mid",
        agencyId: "agency-1",
        title: "Middle Article",
        summary: "This is in the middle.",
        url: "https://example.com/middle",
        source: "MidSource",
        industry: "Tech",
        publishedAt: new Date("2025-01-01T00:00:00Z").toISOString(),
      }
      const newest: TNicheNews = {
        id: "new",
        agencyId: "agency-1",
        title: "Newest Article",
        summary: "This is the newest.",
        url: "https://example.com/newest",
        source: "NewSource",
        industry: "Tech",
        publishedAt: new Date("2026-01-01T00:00:00Z").toISOString(),
      }

      render(<NicheNewsBlock nicheNews={[oldest, middle, newest]} />)

      const titles = screen
        .getAllByText(/Article/)
        .filter((el) => el.tagName === "P")
        .map((el) => el.textContent)

      expect(titles[0]).toBe("Newest Article")
    })
  })

  describe("fetch button", () => {
    it("renders the Fetch News button when onFetch is provided", () => {
      render(<NicheNewsBlock nicheNews={[]} onFetch={jest.fn()} />)

      expect(screen.getByRole("button", { name: "Fetch News" })).toBeInTheDocument()
    })

    it("does not render the Fetch News button when onFetch is not provided", () => {
      render(<NicheNewsBlock nicheNews={[]} />)

      expect(screen.queryByRole("button", { name: "Fetch News" })).not.toBeInTheDocument()
    })

    it("calls onFetch when the Fetch News button is clicked", () => {
      const onFetch = jest.fn()
      render(<NicheNewsBlock nicheNews={[]} onFetch={onFetch} />)

      userEvent.click(screen.getByRole("button", { name: "Fetch News" }))

      expect(onFetch).toHaveBeenCalledTimes(1)
    })

    it("disables the Fetch News button while isFetching is true", () => {
      render(<NicheNewsBlock nicheNews={[]} onFetch={jest.fn()} isFetching />)

      expect(screen.getByRole("button", { name: /Fetching/i })).toBeDisabled()
    })
  })

  describe("pagination", () => {
    it("shows only 5 items on the first page when there are 7 items", () => {
      render(<NicheNewsBlock nicheNews={makeItems(7)} />)

      expect(screen.getAllByText(/^Article \d+$/)).toHaveLength(5)
    })

    it("displays 'Page 1 of 2' when there are 7 items", () => {
      render(<NicheNewsBlock nicheNews={makeItems(7)} />)

      expect(screen.getByText("Page 1 of 2")).toBeInTheDocument()
    })

    it("disables Prev button on page 1", () => {
      render(<NicheNewsBlock nicheNews={makeItems(7)} />)

      expect(screen.getByRole("button", { name: "Prev" })).toBeDisabled()
    })

    it("shows 2 items and 'Page 2 of 2' after clicking Next", () => {
      render(<NicheNewsBlock nicheNews={makeItems(7)} />)

      userEvent.click(screen.getByRole("button", { name: "Next" }))

      expect(screen.getAllByText(/^Article \d+$/)).toHaveLength(2)
      expect(screen.getByText("Page 2 of 2")).toBeInTheDocument()
    })

    it("disables Next button on the last page", () => {
      render(<NicheNewsBlock nicheNews={makeItems(7)} />)

      userEvent.click(screen.getByRole("button", { name: "Next" }))

      expect(screen.getByRole("button", { name: "Next" })).toBeDisabled()
    })

    it("does not render Prev/Next buttons when items fit on one page", () => {
      render(<NicheNewsBlock nicheNews={makeItems(3)} />)

      expect(screen.queryByRole("button", { name: "Prev" })).not.toBeInTheDocument()
      expect(screen.queryByRole("button", { name: "Next" })).not.toBeInTheDocument()
    })
  })
})

describe("IdeaDetailDlg", () => {
  it("renders nothing when idea is null", () => {
    render(
      <IdeaDetailDlg idea={null} onClose={jest.fn()} />
    )

    expect(screen.queryByText(mockIdea.title)).not.toBeInTheDocument()
  })

  it("renders the dialog when idea is provided", () => {
    render(
      <IdeaDetailDlg idea={mockIdea} onClose={jest.fn()} />
    )

    expect(screen.getByText("Leverage AI for email campaigns")).toBeInTheDocument()
  })

  it("renders the idea status badge", () => {
    render(
      <IdeaDetailDlg idea={mockIdea} onClose={jest.fn()} />
    )

    expect(screen.getByText("New")).toBeInTheDocument()
  })

  it("renders the description", () => {
    render(
      <IdeaDetailDlg idea={mockIdea} onClose={jest.fn()} />
    )

    expect(
      screen.getByText("Use generative AI to personalise every email send.")
    ).toBeInTheDocument()
  })

  it("renders all who/what/why/how/feeling translated values", () => {
    render(
      <IdeaDetailDlg idea={mockIdea} onClose={jest.fn()} />
    )

    expect(screen.getByText("Person")).toBeInTheDocument()
    expect(screen.getByText("Story")).toBeInTheDocument()
    expect(screen.getByText("Inspire")).toBeInTheDocument()
    expect(screen.getByText("Storytelling")).toBeInTheDocument()
    expect(screen.getByText("Excitement")).toBeInTheDocument()
  })

  it("renders the field labels", () => {
    render(
      <IdeaDetailDlg idea={mockIdea} onClose={jest.fn()} />
    )

    expect(screen.getByText("Who")).toBeInTheDocument()
    expect(screen.getByText("What")).toBeInTheDocument()
    expect(screen.getByText("Why")).toBeInTheDocument()
    expect(screen.getByText("How")).toBeInTheDocument()
    expect(screen.getByText("Feeling")).toBeInTheDocument()
  })

  it("calls onClose when the close button is clicked", () => {
    const onClose = jest.fn()
    render(
      <IdeaDetailDlg idea={mockIdea} onClose={onClose} />
    )

    userEvent.click(screen.getByRole("button", { name: "Close" }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("does not render fields that have no value", () => {
    const ideaWithoutFeeling: TIdeaAI = { ...mockIdea, feeling: "" }
    render(
      <IdeaDetailDlg idea={ideaWithoutFeeling} onClose={jest.fn()} />
    )

    expect(screen.queryByText("Feeling")).not.toBeInTheDocument()
  })
})

import React from "react"
import { render, screen } from "@testing-library/react"
import { NicheNewsBlock } from "./NicheNewsBlock"
import { TNicheNews } from "../../../models/NicheNews"

const baseItem: TNicheNews = {
  id: "1",
  agencyId: "agency-1",
  title: "AI Takes Over Marketing",
  summary: "A detailed look at how AI is reshaping digital marketing strategies worldwide.",
  url: "https://example.com/ai-marketing",
  source: "TechCrunch",
  industry: "Technology",
  publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
}

const secondItem: TNicheNews = {
  id: "2",
  agencyId: "agency-1",
  title: "Social Commerce Growth in 2026",
  summary: "Brands are doubling down on social commerce as conversion rates improve.",
  url: "https://example.com/social-commerce",
  source: "Forbes",
  industry: "E-commerce",
  publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
}

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

    it("does not render any links when nicheNews array is empty", () => {
      render(<NicheNewsBlock nicheNews={[]} />)

      expect(screen.queryAllByRole("link")).toHaveLength(0)
    })
  })

  describe("news list", () => {
    it("renders one link per news item", () => {
      render(<NicheNewsBlock nicheNews={[baseItem, secondItem]} />)

      expect(screen.getAllByRole("link")).toHaveLength(2)
    })

    it("does not show empty state message when items are present", () => {
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
        screen.getByText("A detailed look at how AI is reshaping digital marketing strategies worldwide.")
      ).toBeInTheDocument()
      expect(
        screen.getByText("Brands are doubling down on social commerce as conversion rates improve.")
      ).toBeInTheDocument()
    })

    it("renders source and industry for each item", () => {
      render(<NicheNewsBlock nicheNews={[baseItem]} />)

      expect(screen.getByText(/TechCrunch/)).toBeInTheDocument()
      expect(screen.getByText(/Technology/)).toBeInTheDocument()
    })

    it("renders a relative date for each item", () => {
      render(<NicheNewsBlock nicheNews={[baseItem]} />)

      // formatDistanceToNow produces strings like "about 2 hours ago"
      expect(screen.getByText(/ago/)).toBeInTheDocument()
    })
  })

  describe("link behaviour", () => {
    it("sets href to item url", () => {
      render(<NicheNewsBlock nicheNews={[baseItem]} />)

      const link = screen.getByRole("link", { name: /AI Takes Over Marketing/i })
      expect(link).toHaveAttribute("href", "https://example.com/ai-marketing")
    })

    it("opens links in a new tab", () => {
      render(<NicheNewsBlock nicheNews={[baseItem]} />)

      const link = screen.getByRole("link", { name: /AI Takes Over Marketing/i })
      expect(link).toHaveAttribute("target", "_blank")
    })

    it("sets rel to noopener noreferrer for security", () => {
      render(<NicheNewsBlock nicheNews={[baseItem]} />)

      const link = screen.getByRole("link", { name: /AI Takes Over Marketing/i })
      expect(link).toHaveAttribute("rel", "noopener noreferrer")
    })

    it("wraps each item entirely in an anchor tag", () => {
      render(<NicheNewsBlock nicheNews={[baseItem]} />)

      const link = screen.getByRole("link", { name: /AI Takes Over Marketing/i })
      // title, meta line, and summary should all be inside the anchor
      expect(link).toHaveTextContent("AI Takes Over Marketing")
      expect(link).toHaveTextContent("TechCrunch")
      expect(link).toHaveTextContent("A detailed look at how AI is reshaping")
    })
  })

  describe("single item render", () => {
    it("renders correctly with a single news item", () => {
      render(<NicheNewsBlock nicheNews={[baseItem]} />)

      expect(screen.getAllByRole("link")).toHaveLength(1)
      expect(screen.getByText("AI Takes Over Marketing")).toBeInTheDocument()
    })
  })
})

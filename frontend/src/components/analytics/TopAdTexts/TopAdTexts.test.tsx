import React from 'react'
import { render, screen } from '@testing-library/react'
import { TopAdTexts } from './TopAdTexts'

const mockAds = [
  { competitorName: "Competitor A", text: "Transform your business with AI solutions.", collationCount: 3, url: "https://facebook.com/ads/library/?id=111" },
  { competitorName: "Competitor B", text: "Join 10,000+ businesses using our platform.", collationCount: 1, url: null },
  { competitorName: "Competitor A", text: "Schedule and publish content across all platforms.", collationCount: 2, url: "https://facebook.com/ads/library/?id=333" },
]

describe('TopAdTexts', () => {
  it('renders the "Top Ad Texts" heading', () => {
    render(<TopAdTexts ads={mockAds} />)

    expect(screen.getByRole('heading', { name: 'Top Ad Texts' })).toBeInTheDocument()
  })

  it('renders nothing when ads array is empty', () => {
    const { container } = render(<TopAdTexts ads={[]} />)

    expect(container.firstChild).toBeNull()
  })

  it('renders all ad cards with competitor names', () => {
    render(<TopAdTexts ads={mockAds} />)

    const competitorA = screen.getAllByText('Competitor A')
    expect(competitorA).toHaveLength(2)
    expect(screen.getByText('Competitor B')).toBeInTheDocument()
  })

  it('displays ad text content', () => {
    render(<TopAdTexts ads={mockAds} />)

    expect(screen.getByText(/Transform your business with AI/)).toBeInTheDocument()
    expect(screen.getByText(/Join 10,000\+ businesses/)).toBeInTheDocument()
    expect(screen.getByText(/Schedule and publish content/)).toBeInTheDocument()
  })

  it('renders copies badge for all ads including collationCount of 1', () => {
    render(<TopAdTexts ads={mockAds} />)

    expect(screen.getByText('3 copies')).toBeInTheDocument()
    expect(screen.getByText('1 copy')).toBeInTheDocument()
    expect(screen.getByText('2 copies')).toBeInTheDocument()

    const allBadges = screen.getAllByText(/cop(y|ies)/)
    expect(allBadges).toHaveLength(3)
  })

  it('renders competitor name as a link when url is provided', () => {
    render(<TopAdTexts ads={mockAds} />)

    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(2)
    expect(links[0]).toHaveAttribute('href', 'https://facebook.com/ads/library/?id=111')
    expect(links[0]).toHaveAttribute('target', '_blank')
    expect(links[1]).toHaveAttribute('href', 'https://facebook.com/ads/library/?id=333')
  })

  it('renders competitor name as plain text when url is null', () => {
    render(<TopAdTexts ads={mockAds} />)

    const competitorB = screen.getByText('Competitor B')
    expect(competitorB.tagName).toBe('P')
  })
})

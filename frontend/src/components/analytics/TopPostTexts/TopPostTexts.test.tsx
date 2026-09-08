import React from 'react'
import { render, screen } from '@testing-library/react'
import { TopPostTexts } from './TopPostTexts'

const mockPosts = [
  { competitorName: 'Competitor A', text: 'Discover the future of marketing automation.', collationCount: 3, url: 'https://facebook.com/permalink/111' },
  { competitorName: 'Competitor B', text: 'Join 5,000+ brands growing with our platform.', collationCount: 1, url: null },
  { competitorName: 'Competitor A', text: 'Schedule posts across every social channel.', collationCount: 2, url: 'https://facebook.com/permalink/333' },
]

describe('TopPostTexts', () => {
  it('renders the "Top Post Texts" heading', () => {
    render(<TopPostTexts posts={mockPosts} />)

    expect(screen.getByRole('heading', { name: 'Top Post Texts' })).toBeInTheDocument()
  })

  it('renders nothing when posts array is empty', () => {
    const { container } = render(<TopPostTexts posts={[]} />)

    expect(container.firstChild).toBeNull()
  })

  it('renders all post cards with competitor names', () => {
    render(<TopPostTexts posts={mockPosts} />)

    const competitorA = screen.getAllByText('Competitor A')
    expect(competitorA).toHaveLength(2)
    expect(screen.getByText('Competitor B')).toBeInTheDocument()
  })

  it('displays post text content', () => {
    render(<TopPostTexts posts={mockPosts} />)

    expect(screen.getByText(/Discover the future of marketing/)).toBeInTheDocument()
    expect(screen.getByText(/Join 5,000\+ brands/)).toBeInTheDocument()
    expect(screen.getByText(/Schedule posts across every/)).toBeInTheDocument()
  })

  it('renders copies badge for all posts including collationCount of 1', () => {
    render(<TopPostTexts posts={mockPosts} />)

    expect(screen.getByText('3 copies')).toBeInTheDocument()
    expect(screen.getByText('1 copy')).toBeInTheDocument()
    expect(screen.getByText('2 copies')).toBeInTheDocument()

    const allBadges = screen.getAllByText(/cop(y|ies)/)
    expect(allBadges).toHaveLength(3)
  })

  it('renders competitor name as a link when url is provided', () => {
    render(<TopPostTexts posts={mockPosts} />)

    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(2)
    expect(links[0]).toHaveAttribute('href', 'https://facebook.com/permalink/111')
    expect(links[0]).toHaveAttribute('target', '_blank')
    expect(links[1]).toHaveAttribute('href', 'https://facebook.com/permalink/333')
  })

  it('renders competitor name as plain text when url is null', () => {
    render(<TopPostTexts posts={mockPosts} />)

    const competitorB = screen.getByText('Competitor B')
    expect(competitorB.tagName).toBe('P')
  })

  it('renders link with rel noopener noreferrer', () => {
    render(<TopPostTexts posts={mockPosts} />)

    const links = screen.getAllByRole('link')
    links.forEach((link) => {
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })

  it('renders a single post card correctly', () => {
    const singlePost = [{ competitorName: 'Solo Brand', text: 'Only post here.', collationCount: 7, url: null }]
    render(<TopPostTexts posts={singlePost} />)

    expect(screen.getByText('Solo Brand')).toBeInTheDocument()
    expect(screen.getByText('Only post here.')).toBeInTheDocument()
    expect(screen.getByText('7 copies')).toBeInTheDocument()
  })
})

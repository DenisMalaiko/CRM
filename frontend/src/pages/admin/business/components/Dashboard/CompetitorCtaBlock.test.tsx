import React from 'react'
import { render, screen } from '@testing-library/react'
import { CompetitorCtaBlock } from './CompetitorCtaBlock'
import { TCompetitorWithReport } from '../../../../../models/Competitor'

function makeCompetitor(overrides: Partial<TCompetitorWithReport> = {}): TCompetitorWithReport {
  return {
    id: '1',
    businessId: 'biz-1',
    name: 'Competitor A',
    facebookLink: '',
    instagramLink: '',
    isActive: true,
    createdAt: new Date(),
    instagramReport: null,
    facebookReport: null,
    ...overrides,
  }
}

function makeFacebookReport(counts: {
  adsCtaWebsite?: number
  adsCtaDirectMessage?: number
  adsCtaInstagramPage?: number
  adsCtaProduct?: number
  adsCtaMetaPage?: number
}) {
  return {
    id: 'rep-1',
    competitorId: '1',
    followers: 0,
    posts: 0,
    ads: 0,
    ads30d: 0,
    adsVideoCount: 0,
    adsImageCount: 0,
    adsCarouselCount: 0,
    adsDcoCount: 0,
    adsCtaWebsite: counts.adsCtaWebsite ?? 0,
    adsCtaDirectMessage: counts.adsCtaDirectMessage ?? 0,
    adsCtaInstagramPage: counts.adsCtaInstagramPage ?? 0,
    adsCtaProduct: counts.adsCtaProduct ?? 0,
    adsCtaMetaPage: counts.adsCtaMetaPage ?? 0,
    topAdTexts: [],
    fetchedAt: '2024-01-01',
  }
}

describe('CompetitorCtaBlock', () => {
  it('returns null when competitors array is empty', () => {
    const { container } = render(<CompetitorCtaBlock competitors={[]} />)

    expect(container.firstChild).toBeNull()
  })

  it('returns null when all competitors have null facebookReport', () => {
    const competitors = [makeCompetitor(), makeCompetitor({ id: '2', name: 'Competitor B' })]
    const { container } = render(<CompetitorCtaBlock competitors={competitors} />)

    expect(container.firstChild).toBeNull()
  })

  it('returns null when all CTA values sum to zero', () => {
    const competitors = [
      makeCompetitor({ facebookReport: makeFacebookReport({}) }),
    ]
    const { container } = render(<CompetitorCtaBlock competitors={competitors} />)

    expect(container.firstChild).toBeNull()
  })

  it('renders "Call-to-Actions" heading when total is greater than zero', () => {
    const competitors = [
      makeCompetitor({ facebookReport: makeFacebookReport({ adsCtaWebsite: 5 }) }),
    ]
    render(<CompetitorCtaBlock competitors={competitors} />)

    expect(screen.getByRole('heading', { name: 'Call-to-Actions' })).toBeInTheDocument()
  })

  it('renders all 5 CTA category labels', () => {
    const competitors = [
      makeCompetitor({ facebookReport: makeFacebookReport({ adsCtaWebsite: 1 }) }),
    ]
    render(<CompetitorCtaBlock competitors={competitors} />)

    expect(screen.getByText('Website')).toBeInTheDocument()
    expect(screen.getByText('Direct Message')).toBeInTheDocument()
    expect(screen.getByText('Instagram Page')).toBeInTheDocument()
    expect(screen.getByText('Product')).toBeInTheDocument()
    expect(screen.getByText('Meta Page')).toBeInTheDocument()
  })

  it('aggregates CTA counts from multiple competitors', () => {
    const competitors = [
      makeCompetitor({
        id: '1',
        facebookReport: makeFacebookReport({
          adsCtaWebsite: 4,
          adsCtaDirectMessage: 2,
          adsCtaInstagramPage: 1,
          adsCtaProduct: 3,
          adsCtaMetaPage: 0,
        }),
      }),
      makeCompetitor({
        id: '2',
        name: 'Competitor B',
        facebookReport: makeFacebookReport({
          adsCtaWebsite: 1,
          adsCtaDirectMessage: 3,
          adsCtaInstagramPage: 2,
          adsCtaProduct: 0,
          adsCtaMetaPage: 5,
        }),
      }),
    ]
    render(<CompetitorCtaBlock competitors={competitors} />)

    expect(screen.getAllByText('5')).toHaveLength(3)
    expect(screen.getAllByText('3')).toHaveLength(2)
  })

  it('skips competitors with null facebookReport without throwing', () => {
    const competitors = [
      makeCompetitor({ id: '1', facebookReport: null }),
      makeCompetitor({
        id: '2',
        name: 'Competitor B',
        facebookReport: makeFacebookReport({ adsCtaWebsite: 7 }),
      }),
    ]
    render(<CompetitorCtaBlock competitors={competitors} />)

    expect(screen.getByRole('heading', { name: 'Call-to-Actions' })).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()
  })
})

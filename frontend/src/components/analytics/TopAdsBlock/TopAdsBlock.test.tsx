import React from 'react'
import { render, screen, within } from '@testing-library/react'
import { TopAdsBlock } from './TopAdsBlock'
import { TCompetitorWithReport, TTopAd } from '../../../models/Competitor'

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

function makeFacebookReport(topAds: TTopAd[] = []) {
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
    adsCtaWebsite: 0,
    adsCtaDirectMessage: 0,
    adsCtaInstagramPage: 0,
    adsCtaProduct: 0,
    adsCtaMetaPage: 0,
    postsImageCount: 0,
    postsVideoCount: 0,
    postsCarouselCount: 0,
    topAdTexts: [],
    topAds,
    fetchedAt: '2024-01-01',
  }
}

function makeTopAd(overrides: Partial<TTopAd> = {}): TTopAd {
  return {
    title: null,
    adId: 'ad-1',
    format: 'image',
    url: 'https://facebook.com/ads/library/?id=ad-1',
    image: null,
    video: null,
    activeDays: 30,
    ...overrides,
  }
}

describe('TopAdsBlock', () => {
  it('returns null when competitors array is empty', () => {
    const { container } = render(<TopAdsBlock competitors={[]} />)

    expect(container.firstChild).toBeNull()
  })

  it('returns null when no competitor has topAds', () => {
    const competitors = [
      makeCompetitor({ facebookReport: null }),
      makeCompetitor({ id: '2', facebookReport: makeFacebookReport([]) }),
    ]
    const { container } = render(<TopAdsBlock competitors={competitors} />)

    expect(container.firstChild).toBeNull()
  })

  it('renders "Top Ads" heading when ads exist', () => {
    const competitors = [
      makeCompetitor({ facebookReport: makeFacebookReport([makeTopAd()]) }),
    ]
    render(<TopAdsBlock competitors={competitors} />)

    expect(screen.getByRole('heading', { name: 'Top Ads' })).toBeInTheDocument()
  })

  it('renders correct competitor name and ad_id', () => {
    const competitors = [
      makeCompetitor({
        name: 'Nike',
        facebookReport: makeFacebookReport([makeTopAd({ adId: 'ad-xyz-999' })]),
      }),
    ]
    render(<TopAdsBlock competitors={competitors} />)

    expect(screen.getByText('Nike')).toBeInTheDocument()
    expect(screen.getByText('ad_id: ad-xyz-999')).toBeInTheDocument()
  })

  it('renders days badge with activeDays value', () => {
    const competitors = [
      makeCompetitor({
        facebookReport: makeFacebookReport([makeTopAd({ activeDays: 42 })]),
      }),
    ]
    render(<TopAdsBlock competitors={competitors} />)

    expect(screen.getByText('42 days')).toBeInTheDocument()
  })

  it('does not render days badge when activeDays is null', () => {
    const competitors = [
      makeCompetitor({
        facebookReport: makeFacebookReport([makeTopAd({ activeDays: null })]),
      }),
    ]
    render(<TopAdsBlock competitors={competitors} />)

    expect(screen.queryByText(/days/)).not.toBeInTheDocument()
  })

  it('renders format label in uppercase', () => {
    const competitors = [
      makeCompetitor({
        facebookReport: makeFacebookReport([makeTopAd({ format: 'video' })]),
      }),
    ]
    render(<TopAdsBlock competitors={competitors} />)

    const formatLabel = screen.getByText('video')
    expect(formatLabel).toBeInTheDocument()
  })

  it('renders "Open in Meta Ad Library" link with correct href', () => {
    const url = 'https://facebook.com/ads/library/?id=ad-1'
    const competitors = [
      makeCompetitor({
        facebookReport: makeFacebookReport([makeTopAd({ url })]),
      }),
    ]
    render(<TopAdsBlock competitors={competitors} />)

    const link = screen.getByRole('link', { name: /Open in Meta Ad Library/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', url)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('does not render link when url is null', () => {
    const competitors = [
      makeCompetitor({
        facebookReport: makeFacebookReport([makeTopAd({ url: null })]),
      }),
    ]
    render(<TopAdsBlock competitors={competitors} />)

    expect(screen.queryByRole('link', { name: /Open in Meta Ad Library/i })).not.toBeInTheDocument()
  })

  it('aggregates ads from multiple competitors and sorts by activeDays desc', () => {
    const competitors = [
      makeCompetitor({
        id: '1',
        name: 'Competitor A',
        facebookReport: makeFacebookReport([
          makeTopAd({ adId: 'ad-low', activeDays: 5 }),
          makeTopAd({ adId: 'ad-high', activeDays: 100 }),
        ]),
      }),
      makeCompetitor({
        id: '2',
        name: 'Competitor B',
        facebookReport: makeFacebookReport([
          makeTopAd({ adId: 'ad-mid', activeDays: 50 }),
        ]),
      }),
    ]
    render(<TopAdsBlock competitors={competitors} />)

    const adIds = screen.getAllByText(/ad_id:/)
    expect(adIds[0]).toHaveTextContent('ad_id: ad-high')
    expect(adIds[1]).toHaveTextContent('ad_id: ad-mid')
    expect(adIds[2]).toHaveTextContent('ad_id: ad-low')
  })

  it('limits rendered ads to 10 maximum', () => {
    const ads = Array.from({ length: 15 }, (_, i) =>
      makeTopAd({ adId: `ad-${i}`, activeDays: i })
    )
    const competitors = [
      makeCompetitor({ facebookReport: makeFacebookReport(ads) }),
    ]
    render(<TopAdsBlock competitors={competitors} />)

    const adLabels = screen.getAllByText(/ad_id:/)
    expect(adLabels).toHaveLength(10)
  })

  it('renders video placeholder when image is null', () => {
    const competitors = [
      makeCompetitor({
        facebookReport: makeFacebookReport([makeTopAd({ image: null })]),
      }),
    ]
    const { container } = render(<TopAdsBlock competitors={competitors} />)

    expect(container.querySelector('img')).not.toBeInTheDocument()
    expect(container.querySelector('.bg-slate-900')).toBeInTheDocument()
  })

  it('renders image when image url is provided', () => {
    const competitors = [
      makeCompetitor({
        facebookReport: makeFacebookReport([
          makeTopAd({ image: 'https://example.com/ad.jpg' }),
        ]),
      }),
    ]
    const { container } = render(<TopAdsBlock competitors={competitors} />)

    const img = container.querySelector('img')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'https://example.com/ad.jpg')
  })
})

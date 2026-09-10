import React from 'react'
import { render, screen } from '@testing-library/react'
import { TopAdsBlock } from './TopAdsBlock'
import { TTopAd } from '../../../models/Competitor'

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
  it('returns null when ads array is empty', () => {
    const { container } = render(<TopAdsBlock ads={[]} />)

    expect(container.firstChild).toBeNull()
  })

  it('renders "Top Ads" heading when ads exist', () => {
    render(<TopAdsBlock ads={[makeTopAd()]} />)

    expect(screen.getByRole('heading', { name: 'Top Ads' })).toBeInTheDocument()
  })

  it('renders ad_id for each ad', () => {
    render(<TopAdsBlock ads={[makeTopAd({ adId: 'ad-xyz-999' })]} />)

    expect(screen.getByText('ad_id: ad-xyz-999')).toBeInTheDocument()
  })

  it('renders days badge with activeDays value', () => {
    render(<TopAdsBlock ads={[makeTopAd({ activeDays: 42 })]} />)

    expect(screen.getByText('42 days')).toBeInTheDocument()
  })

  it('does not render days badge when activeDays is null', () => {
    render(<TopAdsBlock ads={[makeTopAd({ activeDays: null })]} />)

    expect(screen.queryByText(/days/)).not.toBeInTheDocument()
  })

  it('renders format label when format is provided', () => {
    render(<TopAdsBlock ads={[makeTopAd({ format: 'video' })]} />)

    expect(screen.getByText('video')).toBeInTheDocument()
  })

  it('renders "Open in Meta Ad Library" link with correct href', () => {
    const url = 'https://facebook.com/ads/library/?id=ad-1'
    render(<TopAdsBlock ads={[makeTopAd({ url })]} />)

    const link = screen.getByRole('link', { name: /Open in Meta Ad Library/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', url)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('does not render link when url is null', () => {
    render(<TopAdsBlock ads={[makeTopAd({ url: null })]} />)

    expect(screen.queryByRole('link', { name: /Open in Meta Ad Library/i })).not.toBeInTheDocument()
  })

  it('sorts ads by activeDays desc', () => {
    const ads = [
      makeTopAd({ adId: 'ad-low', activeDays: 5 }),
      makeTopAd({ adId: 'ad-high', activeDays: 100 }),
      makeTopAd({ adId: 'ad-mid', activeDays: 50 }),
    ]
    render(<TopAdsBlock ads={ads} />)

    const adIds = screen.getAllByText(/ad_id:/)
    expect(adIds[0]).toHaveTextContent('ad_id: ad-high')
    expect(adIds[1]).toHaveTextContent('ad_id: ad-mid')
    expect(adIds[2]).toHaveTextContent('ad_id: ad-low')
  })

  it('limits rendered ads to 10 maximum', () => {
    const ads = Array.from({ length: 15 }, (_, i) =>
      makeTopAd({ adId: `ad-${i}`, activeDays: i })
    )
    render(<TopAdsBlock ads={ads} />)

    const adLabels = screen.getAllByText(/ad_id:/)
    expect(adLabels).toHaveLength(10)
  })

  it('places ads with null activeDays after ads with activeDays', () => {
    const ads = [
      makeTopAd({ adId: 'ad-null', activeDays: null }),
      makeTopAd({ adId: 'ad-valued', activeDays: 1 }),
    ]
    render(<TopAdsBlock ads={ads} />)

    const adIds = screen.getAllByText(/ad_id:/)
    expect(adIds[0]).toHaveTextContent('ad_id: ad-valued')
    expect(adIds[1]).toHaveTextContent('ad_id: ad-null')
  })

  it('renders image when image url is provided', () => {
    const { container } = render(
      <TopAdsBlock ads={[makeTopAd({ image: 'https://example.com/ad.jpg' })]} />
    )

    const img = container.querySelector('img')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'https://example.com/ad.jpg')
  })

  it('renders placeholder when image and video are both null', () => {
    const { container } = render(
      <TopAdsBlock ads={[makeTopAd({ image: null, video: null })]} />
    )

    expect(container.querySelector('img')).not.toBeInTheDocument()
    expect(container.querySelector('video')).not.toBeInTheDocument()
    expect(container.querySelector('.bg-slate-900')).toBeInTheDocument()
  })

  it('renders video element when video url is provided', () => {
    const { container } = render(
      <TopAdsBlock ads={[makeTopAd({ video: 'https://example.com/ad.mp4', image: null })]} />
    )

    const video = container.querySelector('video')
    expect(video).toBeInTheDocument()
    expect(video).toHaveAttribute('src', 'https://example.com/ad.mp4')
  })
})

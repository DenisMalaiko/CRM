import React from 'react'
import { render, screen } from '@testing-library/react'
import { TopPostsBlock } from './TopPostsBlock'
import { TCompetitorWithReport, TTopPost } from '../../../models/Competitor'

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

function makeFacebookReport(topPosts: TTopPost[] = []) {
  return {
    id: 'rep-1',
    competitorId: '1',
    followers: 0,
    posts: 0,
    postsImageCount: 0,
    postsVideoCount: 0,
    postsCarouselCount: 0,
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
    topAdTexts: [],
    topAds: [],
    topPostTexts: [],
    topPosts,
    fetchedAt: '2024-01-01',
  }
}

function makeTopPost(overrides: Partial<TTopPost> = {}): TTopPost {
  return {
    postId: 'post-1',
    format: 'image',
    url: 'https://facebook.com/permalink/post-1',
    image: null,
    video: null,
    reactions: 100,
    comments: 10,
    shares: 5,
    ...overrides,
  }
}

describe('TopPostsBlock', () => {
  it('returns null when competitors array is empty', () => {
    const { container } = render(<TopPostsBlock competitors={[]} />)

    expect(container.firstChild).toBeNull()
  })

  it('returns null when no competitor has topPosts', () => {
    const competitors = [
      makeCompetitor({ facebookReport: null }),
      makeCompetitor({ id: '2', facebookReport: makeFacebookReport([]) }),
    ]
    const { container } = render(<TopPostsBlock competitors={competitors} />)

    expect(container.firstChild).toBeNull()
  })

  it('renders "Top Posts" heading when posts exist', () => {
    const competitors = [
      makeCompetitor({ facebookReport: makeFacebookReport([makeTopPost()]) }),
    ]
    render(<TopPostsBlock competitors={competitors} />)

    expect(screen.getByRole('heading', { name: 'Top Posts' })).toBeInTheDocument()
  })

  it('renders correct competitor name and post_id', () => {
    const competitors = [
      makeCompetitor({
        name: 'Nike',
        facebookReport: makeFacebookReport([makeTopPost({ postId: 'post-xyz-999' })]),
      }),
    ]
    render(<TopPostsBlock competitors={competitors} />)

    expect(screen.getByText('Nike')).toBeInTheDocument()
    expect(screen.getByText('post_id: post-xyz-999')).toBeInTheDocument()
  })

  it('renders reactions badge with reactions value', () => {
    const competitors = [
      makeCompetitor({
        facebookReport: makeFacebookReport([makeTopPost({ reactions: 420 })]),
      }),
    ]
    render(<TopPostsBlock competitors={competitors} />)

    expect(screen.getByText('420 reactions')).toBeInTheDocument()
  })

  it('does not render reactions badge when reactions is null', () => {
    const competitors = [
      makeCompetitor({
        facebookReport: makeFacebookReport([makeTopPost({ reactions: null })]),
      }),
    ]
    render(<TopPostsBlock competitors={competitors} />)

    expect(screen.queryByText(/reactions/)).not.toBeInTheDocument()
  })

  it('renders comments count when provided', () => {
    const competitors = [
      makeCompetitor({
        facebookReport: makeFacebookReport([makeTopPost({ comments: 88 })]),
      }),
    ]
    render(<TopPostsBlock competitors={competitors} />)

    expect(screen.getByText('88 comments')).toBeInTheDocument()
  })

  it('does not render comments when comments is null', () => {
    const competitors = [
      makeCompetitor({
        facebookReport: makeFacebookReport([makeTopPost({ comments: null })]),
      }),
    ]
    render(<TopPostsBlock competitors={competitors} />)

    expect(screen.queryByText(/comments/)).not.toBeInTheDocument()
  })

  it('renders shares count when provided', () => {
    const competitors = [
      makeCompetitor({
        facebookReport: makeFacebookReport([makeTopPost({ shares: 33 })]),
      }),
    ]
    render(<TopPostsBlock competitors={competitors} />)

    expect(screen.getByText('33 shares')).toBeInTheDocument()
  })

  it('does not render shares when shares is null', () => {
    const competitors = [
      makeCompetitor({
        facebookReport: makeFacebookReport([makeTopPost({ shares: null })]),
      }),
    ]
    render(<TopPostsBlock competitors={competitors} />)

    expect(screen.queryByText(/shares/)).not.toBeInTheDocument()
  })

  it('renders format badge when format is provided', () => {
    const competitors = [
      makeCompetitor({
        facebookReport: makeFacebookReport([makeTopPost({ format: 'video' })]),
      }),
    ]
    render(<TopPostsBlock competitors={competitors} />)

    expect(screen.getByText('video')).toBeInTheDocument()
  })

  it('does not render format badge when format is null', () => {
    const competitors = [
      makeCompetitor({
        facebookReport: makeFacebookReport([makeTopPost({ format: null })]),
      }),
    ]
    render(<TopPostsBlock competitors={competitors} />)

    expect(screen.queryByText('image')).not.toBeInTheDocument()
  })

  it('renders "Open Post" link with correct href', () => {
    const url = 'https://facebook.com/permalink/post-1'
    const competitors = [
      makeCompetitor({
        facebookReport: makeFacebookReport([makeTopPost({ url })]),
      }),
    ]
    render(<TopPostsBlock competitors={competitors} />)

    const link = screen.getByRole('link', { name: /Open Post/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', url)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('does not render link when url is null', () => {
    const competitors = [
      makeCompetitor({
        facebookReport: makeFacebookReport([makeTopPost({ url: null })]),
      }),
    ]
    render(<TopPostsBlock competitors={competitors} />)

    expect(screen.queryByRole('link', { name: /Open Post/i })).not.toBeInTheDocument()
  })

  it('aggregates posts from multiple competitors and sorts by reactions desc', () => {
    const competitors = [
      makeCompetitor({
        id: '1',
        name: 'Competitor A',
        facebookReport: makeFacebookReport([
          makeTopPost({ postId: 'post-low', reactions: 5 }),
          makeTopPost({ postId: 'post-high', reactions: 500 }),
        ]),
      }),
      makeCompetitor({
        id: '2',
        name: 'Competitor B',
        facebookReport: makeFacebookReport([
          makeTopPost({ postId: 'post-mid', reactions: 100 }),
        ]),
      }),
    ]
    render(<TopPostsBlock competitors={competitors} />)

    const postIds = screen.getAllByText(/post_id:/)
    expect(postIds[0]).toHaveTextContent('post_id: post-high')
    expect(postIds[1]).toHaveTextContent('post_id: post-mid')
    expect(postIds[2]).toHaveTextContent('post_id: post-low')
  })

  it('limits rendered posts to 10 maximum', () => {
    const posts = Array.from({ length: 15 }, (_, i) =>
      makeTopPost({ postId: `post-${i}`, reactions: i })
    )
    const competitors = [
      makeCompetitor({ facebookReport: makeFacebookReport(posts) }),
    ]
    render(<TopPostsBlock competitors={competitors} />)

    const postLabels = screen.getAllByText(/post_id:/)
    expect(postLabels).toHaveLength(10)
  })

  it('places posts with null reactions after posts with reactions', () => {
    const competitors = [
      makeCompetitor({
        facebookReport: makeFacebookReport([
          makeTopPost({ postId: 'post-null', reactions: null }),
          makeTopPost({ postId: 'post-valued', reactions: 1 }),
        ]),
      }),
    ]
    render(<TopPostsBlock competitors={competitors} />)

    const postIds = screen.getAllByText(/post_id:/)
    expect(postIds[0]).toHaveTextContent('post_id: post-valued')
    expect(postIds[1]).toHaveTextContent('post_id: post-null')
  })

  it('renders image when image url is provided', () => {
    const competitors = [
      makeCompetitor({
        facebookReport: makeFacebookReport([
          makeTopPost({ image: 'https://example.com/post.jpg' }),
        ]),
      }),
    ]
    const { container } = render(<TopPostsBlock competitors={competitors} />)

    const img = container.querySelector('img')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'https://example.com/post.jpg')
  })

  it('renders placeholder when image and video are both null', () => {
    const competitors = [
      makeCompetitor({
        facebookReport: makeFacebookReport([makeTopPost({ image: null, video: null })]),
      }),
    ]
    const { container } = render(<TopPostsBlock competitors={competitors} />)

    expect(container.querySelector('img')).not.toBeInTheDocument()
    expect(container.querySelector('video')).not.toBeInTheDocument()
    expect(container.querySelector('.bg-slate-900')).toBeInTheDocument()
  })

  it('renders video element when video url is provided', () => {
    const competitors = [
      makeCompetitor({
        facebookReport: makeFacebookReport([
          makeTopPost({ video: 'https://example.com/post.mp4', image: null }),
        ]),
      }),
    ]
    const { container } = render(<TopPostsBlock competitors={competitors} />)

    const video = container.querySelector('video')
    expect(video).toBeInTheDocument()
    expect(video).toHaveAttribute('src', 'https://example.com/post.mp4')
  })
})

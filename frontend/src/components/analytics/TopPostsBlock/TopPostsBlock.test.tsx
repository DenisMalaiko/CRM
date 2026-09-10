import React from 'react'
import { render, screen } from '@testing-library/react'
import { TopPostsBlock } from './TopPostsBlock'
import { TTopPost } from '../../../models/Competitor'

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
  it('returns null when posts array is empty', () => {
    const { container } = render(<TopPostsBlock posts={[]} />)

    expect(container.firstChild).toBeNull()
  })

  it('renders "Top Posts" heading when posts exist', () => {
    render(<TopPostsBlock posts={[makeTopPost()]} />)

    expect(screen.getByRole('heading', { name: 'Top Posts' })).toBeInTheDocument()
  })

  it('renders post_id for each post', () => {
    render(<TopPostsBlock posts={[makeTopPost({ postId: 'post-xyz-999' })]} />)

    expect(screen.getByText('post_id: post-xyz-999')).toBeInTheDocument()
  })

  it('renders reactions badge with reactions value', () => {
    render(<TopPostsBlock posts={[makeTopPost({ reactions: 420 })]} />)

    expect(screen.getByText('420 reactions')).toBeInTheDocument()
  })

  it('does not render reactions badge when reactions is null', () => {
    render(<TopPostsBlock posts={[makeTopPost({ reactions: null })]} />)

    expect(screen.queryByText(/reactions/)).not.toBeInTheDocument()
  })

  it('does not render comments count even when comments data is provided', () => {
    render(<TopPostsBlock posts={[makeTopPost({ comments: 88 })]} />)

    expect(screen.queryByText(/comments/)).not.toBeInTheDocument()
  })

  it('does not render shares count even when shares data is provided', () => {
    render(<TopPostsBlock posts={[makeTopPost({ shares: 33 })]} />)

    expect(screen.queryByText(/shares/)).not.toBeInTheDocument()
  })

  it('renders format badge when format is provided', () => {
    render(<TopPostsBlock posts={[makeTopPost({ format: 'video' })]} />)

    expect(screen.getByText('video')).toBeInTheDocument()
  })

  it('does not render format badge when format is null', () => {
    render(<TopPostsBlock posts={[makeTopPost({ format: null })]} />)

    expect(screen.queryByText('image')).not.toBeInTheDocument()
  })

  it('renders "Open Post" link with correct href', () => {
    const url = 'https://facebook.com/permalink/post-1'
    render(<TopPostsBlock posts={[makeTopPost({ url })]} />)

    const link = screen.getByRole('link', { name: /Open Post/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', url)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('does not render link when url is null', () => {
    render(<TopPostsBlock posts={[makeTopPost({ url: null })]} />)

    expect(screen.queryByRole('link', { name: /Open Post/i })).not.toBeInTheDocument()
  })

  it('sorts posts by reactions desc', () => {
    const posts = [
      makeTopPost({ postId: 'post-low', reactions: 5 }),
      makeTopPost({ postId: 'post-high', reactions: 500 }),
      makeTopPost({ postId: 'post-mid', reactions: 100 }),
    ]
    render(<TopPostsBlock posts={posts} />)

    const postIds = screen.getAllByText(/post_id:/)
    expect(postIds[0]).toHaveTextContent('post_id: post-high')
    expect(postIds[1]).toHaveTextContent('post_id: post-mid')
    expect(postIds[2]).toHaveTextContent('post_id: post-low')
  })

  it('limits rendered posts to 10 maximum', () => {
    const posts = Array.from({ length: 15 }, (_, i) =>
      makeTopPost({ postId: `post-${i}`, reactions: i })
    )
    render(<TopPostsBlock posts={posts} />)

    const postLabels = screen.getAllByText(/post_id:/)
    expect(postLabels).toHaveLength(10)
  })

  it('places posts with null reactions after posts with reactions', () => {
    const posts = [
      makeTopPost({ postId: 'post-null', reactions: null }),
      makeTopPost({ postId: 'post-valued', reactions: 1 }),
    ]
    render(<TopPostsBlock posts={posts} />)

    const postIds = screen.getAllByText(/post_id:/)
    expect(postIds[0]).toHaveTextContent('post_id: post-valued')
    expect(postIds[1]).toHaveTextContent('post_id: post-null')
  })

  it('renders image when image url is provided', () => {
    const { container } = render(
      <TopPostsBlock posts={[makeTopPost({ image: 'https://example.com/post.jpg' })]} />
    )

    const img = container.querySelector('img')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'https://example.com/post.jpg')
  })

  it('renders placeholder when image and video are both null', () => {
    const { container } = render(
      <TopPostsBlock posts={[makeTopPost({ image: null, video: null })]} />
    )

    expect(container.querySelector('img')).not.toBeInTheDocument()
    expect(container.querySelector('video')).not.toBeInTheDocument()
    expect(container.querySelector('.bg-slate-900')).toBeInTheDocument()
  })

  it('renders video element when video url is provided', () => {
    const { container } = render(
      <TopPostsBlock posts={[makeTopPost({ video: 'https://example.com/post.mp4', image: null })]} />
    )

    const video = container.querySelector('video')
    expect(video).toBeInTheDocument()
    expect(video).toHaveAttribute('src', 'https://example.com/post.mp4')
  })
})

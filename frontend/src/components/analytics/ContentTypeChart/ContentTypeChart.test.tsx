import React from 'react'
import { render, screen } from '@testing-library/react'
import { ContentTypeChart } from './ContentTypeChart'

describe('ContentTypeChart', () => {
  it('renders the title', () => {
    render(<ContentTypeChart postsImageCount={5} postsVideoCount={3} postsCarouselCount={2} />)

    expect(screen.getByText('Posts Formats (90D)')).toBeInTheDocument()
  })

  it('shows "No data yet" when all counts are 0', () => {
    render(<ContentTypeChart postsImageCount={0} postsVideoCount={0} postsCarouselCount={0} />)

    expect(screen.getByText('No data yet')).toBeInTheDocument()
  })

  it('does not render legend when all counts are 0', () => {
    render(<ContentTypeChart postsImageCount={0} postsVideoCount={0} postsCarouselCount={0} />)

    expect(screen.queryByText('Image')).not.toBeInTheDocument()
    expect(screen.queryByText('Video')).not.toBeInTheDocument()
    expect(screen.queryByText('Carousel')).not.toBeInTheDocument()
  })

  it('renders all three legend items when total is greater than 0', () => {
    render(<ContentTypeChart postsImageCount={5} postsVideoCount={3} postsCarouselCount={2} />)

    expect(screen.getByText('Image')).toBeInTheDocument()
    expect(screen.getByText('Video')).toBeInTheDocument()
    expect(screen.getByText('Carousel')).toBeInTheDocument()
  })

  it('shows the total count in the donut center', () => {
    render(<ContentTypeChart postsImageCount={5} postsVideoCount={3} postsCarouselCount={2} />)

    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('shows total for partial counts', () => {
    render(<ContentTypeChart postsImageCount={10} postsVideoCount={0} postsCarouselCount={5} />)

    expect(screen.getByText('15')).toBeInTheDocument()
  })

  it('does not show "No data yet" when total is greater than 0', () => {
    render(<ContentTypeChart postsImageCount={1} postsVideoCount={0} postsCarouselCount={0} />)

    expect(screen.queryByText('No data yet')).not.toBeInTheDocument()
  })
})

import React from 'react'
import { render, screen } from '@testing-library/react'
import { StoriesTypeChart } from './StoriesTypeChart'

describe('StoriesTypeChart', () => {
  it('renders the title', () => {
    render(<StoriesTypeChart storiesImageCount={5} storiesVideoCount={3} />)

    expect(screen.getByText('Stories Formats (90D)')).toBeInTheDocument()
  })

  it('shows "No data yet" when both counts are 0', () => {
    render(<StoriesTypeChart storiesImageCount={0} storiesVideoCount={0} />)

    expect(screen.getByText('No data yet')).toBeInTheDocument()
  })

  it('does not render legend when both counts are 0', () => {
    render(<StoriesTypeChart storiesImageCount={0} storiesVideoCount={0} />)

    expect(screen.queryByText('Image')).not.toBeInTheDocument()
    expect(screen.queryByText('Video')).not.toBeInTheDocument()
  })

  it('renders both legend items when total is greater than 0', () => {
    render(<StoriesTypeChart storiesImageCount={5} storiesVideoCount={3} />)

    expect(screen.getByText('Image')).toBeInTheDocument()
    expect(screen.getByText('Video')).toBeInTheDocument()
  })

  it('shows the total count in the donut center', () => {
    render(<StoriesTypeChart storiesImageCount={5} storiesVideoCount={3} />)

    expect(screen.getByText('8')).toBeInTheDocument()
  })

  it('shows total when only one category has data', () => {
    render(<StoriesTypeChart storiesImageCount={7} storiesVideoCount={0} />)

    expect(screen.getByText('7')).toBeInTheDocument()
  })

  it('does not show "No data yet" when total is greater than 0', () => {
    render(<StoriesTypeChart storiesImageCount={0} storiesVideoCount={1} />)

    expect(screen.queryByText('No data yet')).not.toBeInTheDocument()
  })
})

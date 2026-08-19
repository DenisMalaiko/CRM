import React from 'react'
import { render, screen } from '@testing-library/react'
import { AdsFormatChart } from './AdsFormatChart'

describe('AdsFormatChart', () => {
  it('renders the title', () => {
    render(<AdsFormatChart adsVideoCount={5} adsImageCount={3} adsOtherCount={2} />)

    expect(screen.getByText('Ads Formats')).toBeInTheDocument()
  })

  it('shows "No data yet" when all counts are 0', () => {
    render(<AdsFormatChart adsVideoCount={0} adsImageCount={0} adsOtherCount={0} />)

    expect(screen.getByText('No data yet')).toBeInTheDocument()
  })

  it('does not render legend when all counts are 0', () => {
    render(<AdsFormatChart adsVideoCount={0} adsImageCount={0} adsOtherCount={0} />)

    expect(screen.queryByText('Image')).not.toBeInTheDocument()
    expect(screen.queryByText('Video')).not.toBeInTheDocument()
    expect(screen.queryByText('Other')).not.toBeInTheDocument()
  })

  it('renders all three legend items when total is greater than 0', () => {
    render(<AdsFormatChart adsVideoCount={5} adsImageCount={3} adsOtherCount={2} />)

    expect(screen.getByText('Image')).toBeInTheDocument()
    expect(screen.getByText('Video')).toBeInTheDocument()
    expect(screen.getByText('Other')).toBeInTheDocument()
  })

  it('shows the total count in the donut center', () => {
    render(<AdsFormatChart adsVideoCount={5} adsImageCount={3} adsOtherCount={2} />)

    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('shows total for partial counts', () => {
    render(<AdsFormatChart adsVideoCount={0} adsImageCount={10} adsOtherCount={5} />)

    expect(screen.getByText('15')).toBeInTheDocument()
  })

  it('does not show "No data yet" when total is greater than 0', () => {
    render(<AdsFormatChart adsVideoCount={1} adsImageCount={0} adsOtherCount={0} />)

    expect(screen.queryByText('No data yet')).not.toBeInTheDocument()
  })
})

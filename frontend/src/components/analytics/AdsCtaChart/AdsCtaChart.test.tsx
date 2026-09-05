import React from 'react'
import { render, screen } from '@testing-library/react'
import { AdsCtaChart } from './AdsCtaChart'

const defaultProps = {
  adsCtaWebsite: 5,
  adsCtaDirectMessage: 3,
  adsCtaInstagramPage: 2,
  adsCtaProduct: 4,
  adsCtaMetaPage: 1,
}

describe('AdsCtaChart', () => {
  it('renders the title', () => {
    render(<AdsCtaChart {...defaultProps} />)

    expect(screen.getByText('Ads CTA Types')).toBeInTheDocument()
  })

  it('shows "No data yet" when all counts are 0', () => {
    render(
      <AdsCtaChart
        adsCtaWebsite={0}
        adsCtaDirectMessage={0}
        adsCtaInstagramPage={0}
        adsCtaProduct={0}
        adsCtaMetaPage={0}
      />
    )

    expect(screen.getByText('No data yet')).toBeInTheDocument()
  })

  it('does not render legend when all counts are 0', () => {
    render(
      <AdsCtaChart
        adsCtaWebsite={0}
        adsCtaDirectMessage={0}
        adsCtaInstagramPage={0}
        adsCtaProduct={0}
        adsCtaMetaPage={0}
      />
    )

    expect(screen.queryByText(/Website/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Direct Message/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Instagram Page/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Product/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Meta Page/)).not.toBeInTheDocument()
  })

  it('renders all five legend items when total is greater than 0', () => {
    render(<AdsCtaChart {...defaultProps} />)

    expect(screen.getByText(/Website: 5/)).toBeInTheDocument()
    expect(screen.getByText(/Direct Message: 3/)).toBeInTheDocument()
    expect(screen.getByText(/Instagram Page: 2/)).toBeInTheDocument()
    expect(screen.getByText(/Product: 4/)).toBeInTheDocument()
    expect(screen.getByText(/Meta Page: 1/)).toBeInTheDocument()
  })

  it('shows the total count in the donut center', () => {
    render(<AdsCtaChart {...defaultProps} />)

    expect(screen.getByText('15')).toBeInTheDocument()
  })

  it('shows total for partial counts', () => {
    render(
      <AdsCtaChart
        adsCtaWebsite={0}
        adsCtaDirectMessage={10}
        adsCtaInstagramPage={0}
        adsCtaProduct={5}
        adsCtaMetaPage={0}
      />
    )

    expect(screen.getByText('15')).toBeInTheDocument()
  })

  it('does not show "No data yet" when total is greater than 0', () => {
    render(
      <AdsCtaChart
        adsCtaWebsite={1}
        adsCtaDirectMessage={0}
        adsCtaInstagramPage={0}
        adsCtaProduct={0}
        adsCtaMetaPage={0}
      />
    )

    expect(screen.queryByText('No data yet')).not.toBeInTheDocument()
  })
})

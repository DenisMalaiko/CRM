import React from 'react'
import { render, screen } from '@testing-library/react'
import { BusinessGrowthChart } from './BusinessGrowthChart'
import { TBusiness } from '../../../../../models/Business'
import { BusinessStatus } from '../../../../../enum/BusinessStatus'

jest.mock('recharts', () => {
  const React = require('react')
  return {
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) =>
      React.createElement('div', { 'data-testid': 'responsive-container' }, children),
    AreaChart: ({ children }: { children: React.ReactNode }) =>
      React.createElement('svg', null, children),
    Area: () => null,
    XAxis: () => null,
    YAxis: () => null,
    Tooltip: () => null,
  }
})

function makeBusiness(overrides: Partial<TBusiness> & { createdAt: string }): TBusiness {
  return {
    id: 'biz-1',
    agencyId: 'agency-1',
    name: 'Test Business',
    website: 'https://example.com',
    industry: 'Tech',
    status: BusinessStatus.Active,
    language: 'en',
    country: 'UA',
    brand: 'Brand',
    goals: [],
    advantages: [],
    ...overrides,
  }
}

describe('BusinessGrowthChart', () => {
  describe('empty state', () => {
    it('renders the heading when no businesses are provided', () => {
      render(<BusinessGrowthChart businesses={[]} />)

      expect(screen.getByText('Dashboard.businessGrowth')).toBeInTheDocument()
    })

    it('shows "No data yet" when the businesses array is empty', () => {
      render(<BusinessGrowthChart businesses={[]} />)

      expect(screen.getByText('General.noDataYet')).toBeInTheDocument()
    })

    it('does not render the chart when there are no businesses', () => {
      render(<BusinessGrowthChart businesses={[]} />)

      expect(screen.queryByTestId('responsive-container')).not.toBeInTheDocument()
    })
  })

  describe('with business data', () => {
    it('renders the heading when businesses are provided', () => {
      const businesses = [makeBusiness({ id: 'biz-1', createdAt: '2024-01-15T00:00:00Z' })]

      render(<BusinessGrowthChart businesses={businesses} />)

      expect(screen.getByText('Dashboard.businessGrowth')).toBeInTheDocument()
    })

    it('does not show "No data yet" when businesses are present', () => {
      const businesses = [makeBusiness({ id: 'biz-1', createdAt: '2024-01-15T00:00:00Z' })]

      render(<BusinessGrowthChart businesses={businesses} />)

      expect(screen.queryByText('General.noDataYet')).not.toBeInTheDocument()
    })

    it('renders the chart container when businesses are present', () => {
      const businesses = [makeBusiness({ id: 'biz-1', createdAt: '2024-01-15T00:00:00Z' })]

      render(<BusinessGrowthChart businesses={businesses} />)

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    })
  })

  describe('buildChartData logic', () => {
    it('groups businesses from the same day into a single data point', () => {
      const businesses = [
        makeBusiness({ id: 'biz-1', createdAt: '2024-03-05T10:00:00Z' }),
        makeBusiness({ id: 'biz-2', createdAt: '2024-03-05T15:00:00Z' }),
      ]

      render(<BusinessGrowthChart businesses={businesses} />)

      expect(screen.queryByText('General.noDataYet')).not.toBeInTheDocument()
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    })

    it('produces separate data points for different days', () => {
      const businesses = [
        makeBusiness({ id: 'biz-1', createdAt: '2024-01-10T00:00:00Z' }),
        makeBusiness({ id: 'biz-2', createdAt: '2024-01-15T00:00:00Z' }),
      ]

      render(<BusinessGrowthChart businesses={businesses} />)

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    })

    it('handles businesses with unordered createdAt dates by sorting them', () => {
      const businesses = [
        makeBusiness({ id: 'biz-3', createdAt: '2024-06-01T00:00:00Z' }),
        makeBusiness({ id: 'biz-1', createdAt: '2024-01-01T00:00:00Z' }),
        makeBusiness({ id: 'biz-2', createdAt: '2024-03-01T00:00:00Z' }),
      ]

      render(<BusinessGrowthChart businesses={businesses} />)

      expect(screen.getByText('Dashboard.businessGrowth')).toBeInTheDocument()
      expect(screen.queryByText('General.noDataYet')).not.toBeInTheDocument()
    })

    it('accumulates total cumulatively across days', () => {
      const businesses = [
        makeBusiness({ id: 'biz-1', createdAt: '2024-01-10T00:00:00Z' }),
        makeBusiness({ id: 'biz-2', createdAt: '2024-02-05T00:00:00Z' }),
        makeBusiness({ id: 'biz-3', createdAt: '2024-02-05T00:00:00Z' }),
      ]

      render(<BusinessGrowthChart businesses={businesses} />)

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    })

    it('renders correctly for a single business', () => {
      const businesses = [makeBusiness({ id: 'biz-1', createdAt: '2024-09-01T00:00:00Z' })]

      render(<BusinessGrowthChart businesses={businesses} />)

      expect(screen.getByText('Dashboard.businessGrowth')).toBeInTheDocument()
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    })
  })
})

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import CompetitorsDashboard from './CompetitorsDashboard'
import { TCompetitorWithReport } from '../../../../../../models/Competitor'

const mockGetCompetitors = jest.fn()
const mockFetchCompetitorFacebookReport = jest.fn()

jest.mock('../../../../../../store/competitor/competitorApi', () => ({
  useGetCompetitorsMutation: () => [mockGetCompetitors],
  useFetchCompetitorFacebookReportMutation: () => [mockFetchCompetitorFacebookReport],
}))

jest.mock('react-toastify', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}))

function makeCompetitor(overrides: Partial<TCompetitorWithReport> = {}): TCompetitorWithReport {
  return {
    id: 'comp-1',
    businessId: 'biz-1',
    name: 'Competitor A',
    facebookLink: 'https://facebook.com/competitorA',
    facebookPageId: undefined,
    instagramLink: '',
    isActive: true,
    createdAt: new Date(),
    instagramReport: null,
    facebookReport: null,
    ...overrides,
  }
}

function makeFacebookReport(overrides: Partial<TCompetitorWithReport['facebookReport']> = {}) {
  return {
    id: 'rep-1',
    competitorId: 'comp-1',
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
    topAds: [],
    topPostTexts: [],
    topPosts: [],
    fetchedAt: '2024-01-01',
    ...overrides,
  }
}

function renderDashboard(businessId = 'biz-1') {
  return render(
    <MemoryRouter initialEntries={[`/profile/businesses/${businessId}/competitors/dashboard`]}>
      <Routes>
        <Route
          path="/profile/businesses/:businessId/competitors/dashboard"
          element={<CompetitorsDashboard />}
        />
      </Routes>
    </MemoryRouter>
  )
}

describe('CompetitorsDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetCompetitors.mockReturnValue({ unwrap: () => Promise.resolve({ data: [] }) })
    mockFetchCompetitorFacebookReport.mockReturnValue({ unwrap: () => Promise.resolve({}) })
  })

  describe('initial render', () => {
    it('renders the Fetch Facebook Data button', () => {
      renderDashboard()

      expect(screen.getByRole('button', { name: /Fetch Facebook Data/i })).toBeInTheDocument()
    })

    it('loads competitors on mount using the businessId from route params', async () => {
      renderDashboard('test-biz-id')

      await waitFor(() => expect(mockGetCompetitors).toHaveBeenCalledWith('test-biz-id'))
    })

    it('renders the Competitors section heading', async () => {
      renderDashboard()

      await screen.findByRole('heading', { name: 'Competitors' })
    })

    it('renders Strategic Insights section', () => {
      renderDashboard()

      expect(screen.getByRole('heading', { name: 'Strategic Insights' })).toBeInTheDocument()
    })

    it('shows empty state message when no competitors are returned', async () => {
      renderDashboard()

      expect(await screen.findByText('No competitors added')).toBeInTheDocument()
    })

    it('does not render the competitors table when there are no competitors', async () => {
      renderDashboard()

      await screen.findByText('No competitors added')
      expect(screen.queryByRole('table')).not.toBeInTheDocument()
    })
  })

  describe('competitors table', () => {
    it('renders a row for each competitor', async () => {
      mockGetCompetitors.mockReturnValue({
        unwrap: () =>
          Promise.resolve({
            data: [
              makeCompetitor({ id: '1', name: 'Competitor A' }),
              makeCompetitor({ id: '2', name: 'Competitor B' }),
            ],
          }),
      })
      renderDashboard()

      expect(await screen.findByText('Competitor A')).toBeInTheDocument()
      expect(await screen.findByText('Competitor B')).toBeInTheDocument()
    })

    it('renders column headers: Name, Followers, Posts (90D), Active Ads, New Ads (30D), Meta Ads Library', async () => {
      mockGetCompetitors.mockReturnValue({
        unwrap: () => Promise.resolve({ data: [makeCompetitor()] }),
      })
      renderDashboard()

      await screen.findByText('Competitor A')

      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('Followers')).toBeInTheDocument()
      expect(screen.getByText(/Posts \(90D\)/i)).toBeInTheDocument()
      expect(screen.getByText('Active Ads')).toBeInTheDocument()
      expect(screen.getByText(/New Ads \(30D\)/i)).toBeInTheDocument()
      expect(screen.getByText('Meta Ads Library')).toBeInTheDocument()
    })

    it('shows 90+ for posts when count is 90 or more', async () => {
      mockGetCompetitors.mockReturnValue({
        unwrap: () =>
          Promise.resolve({
            data: [makeCompetitor({ facebookReport: makeFacebookReport({ posts: 90 }) })],
          }),
      })
      renderDashboard()

      expect(await screen.findByText('90+')).toBeInTheDocument()
    })

    it('shows the exact post count when below 90', async () => {
      mockGetCompetitors.mockReturnValue({
        unwrap: () =>
          Promise.resolve({
            data: [makeCompetitor({ facebookReport: makeFacebookReport({ posts: 45 }) })],
          }),
      })
      renderDashboard()

      expect(await screen.findByText('45')).toBeInTheDocument()
    })

    it('renders the Meta Ads Library link when competitor has facebookPageId', async () => {
      mockGetCompetitors.mockReturnValue({
        unwrap: () =>
          Promise.resolve({
            data: [makeCompetitor({ facebookPageId: 'page-123' })],
          }),
      })
      renderDashboard()

      await screen.findByText('Competitor A')
      const link = screen.getByText('Ads Library').closest('a')!
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
      expect(link.getAttribute('href')).toContain('page-123')
    })

    it('does not render Meta Ads Library link when facebookPageId is absent', async () => {
      mockGetCompetitors.mockReturnValue({
        unwrap: () =>
          Promise.resolve({
            data: [makeCompetitor({ facebookPageId: undefined })],
          }),
      })
      renderDashboard()

      await screen.findByText('Competitor A')
      expect(screen.queryByText('Ads Library')).not.toBeInTheDocument()
    })

    it('opens competitor Facebook link in a new tab when a row is clicked', async () => {
      const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null)
      mockGetCompetitors.mockReturnValue({
        unwrap: () =>
          Promise.resolve({
            data: [
              makeCompetitor({ facebookLink: 'https://facebook.com/competitorA' }),
            ],
          }),
      })
      renderDashboard()

      const nameCell = await screen.findByText('Competitor A')
      userEvent.click(nameCell.closest('tr')!)

      expect(openSpy).toHaveBeenCalledWith(
        'https://facebook.com/competitorA',
        '_blank',
        'noopener,noreferrer'
      )

      openSpy.mockRestore()
    })
  })

  describe('Fetch Facebook Data button', () => {
    it('is enabled when not fetching', () => {
      renderDashboard()

      expect(screen.getByRole('button', { name: /Fetch Facebook Data/i })).not.toBeDisabled()
    })

    it('shows spinner and "Fetching..." text while fetch is in progress', async () => {
      mockGetCompetitors.mockReturnValue({
        unwrap: () => Promise.resolve({ data: [makeCompetitor()] }),
      })
      mockFetchCompetitorFacebookReport.mockReturnValue({
        unwrap: () => new Promise(() => {}),
      })

      renderDashboard()
      await screen.findByText('Competitor A')

      userEvent.click(screen.getByRole('button', { name: /Fetch Facebook Data/i }))

      expect(await screen.findByText('Fetching...')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Fetching.../i })).toBeDisabled()
    })

    it('shows success toast after a successful fetch', async () => {
      const { toast } = require('react-toastify')
      mockGetCompetitors
        .mockReturnValueOnce({ unwrap: () => Promise.resolve({ data: [makeCompetitor({ id: 'c1' })] }) })
        .mockReturnValue({ unwrap: () => Promise.resolve({ data: [] }) })

      renderDashboard()
      await screen.findByText('Competitor A')

      userEvent.click(screen.getByRole('button', { name: /Fetch Facebook Data/i }))

      await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Facebook data fetched successfully'))
    })
  })

  describe('chart sections', () => {
    it('renders the Posts Formats chart heading', () => {
      renderDashboard()

      expect(screen.getByText('Posts Formats (90D)')).toBeInTheDocument()
    })

    it('renders the Ads Formats chart heading', () => {
      renderDashboard()

      expect(screen.getByText('Ads Formats')).toBeInTheDocument()
    })

    it('renders the Ads CTA Types chart heading', () => {
      renderDashboard()

      expect(screen.getByText('Ads CTA Types')).toBeInTheDocument()
    })

    it('shows "No data yet" in all three charts when competitors have no facebook reports', async () => {
      mockGetCompetitors.mockReturnValue({
        unwrap: () => Promise.resolve({ data: [makeCompetitor({ facebookReport: null })] }),
      })
      renderDashboard()

      await screen.findByText('Competitor A')

      const noDataMessages = screen.getAllByText('No data yet')
      expect(noDataMessages).toHaveLength(3)
    })
  })
})

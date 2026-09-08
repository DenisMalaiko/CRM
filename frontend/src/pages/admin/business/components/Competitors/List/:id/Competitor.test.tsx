import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Competitor from './Competitor';

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: 'c-1', businessId: 'biz-1' }),
  useNavigate: () => mockNavigate,
}));

let mockCompetitors: any[] = [];

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: (selector: (state: unknown) => unknown) =>
    selector({ competitorModule: { competitors: mockCompetitors } }),
}));

const mockUnwrap = () => ({ unwrap: () => Promise.resolve({ data: [] }) });

jest.mock('../../../../../../../store/competitor/competitorApi', () => ({
  useFetchCompetitorFacebookReportMutation: () => [jest.fn(mockUnwrap)],
  useGetCompetitorsMutation: () => [jest.fn(mockUnwrap)],
  useGetPostsMutation: () => [jest.fn(mockUnwrap)],
  useGetInstagramPostsMutation: () => [jest.fn(mockUnwrap)],
  useGetInstagramReelsMutation: () => [jest.fn(mockUnwrap)],
  useGetAdsMutation: () => [jest.fn(mockUnwrap)],
}));

jest.mock('../../../../../../../store/competitor/competitorSlice', () => ({
  setCompetitors: (payload: unknown) => ({ type: 'competitor/setCompetitors', payload }),
  setPosts: (payload: unknown) => ({ type: 'competitor/setPosts', payload }),
  setInstagramPosts: (payload: unknown) => ({ type: 'competitor/setInstagramPosts', payload }),
  setInstagramReels: (payload: unknown) => ({ type: 'competitor/setInstagramReels', payload }),
  setAds: (payload: unknown) => ({ type: 'competitor/setAds', payload }),
}));


jest.mock('../../../../../../../store/hooks', () => ({
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({ competitorModule: { competitors: mockCompetitors } }),
  useAppDispatch: () => jest.fn(),
}));

// Child components that make their own Redux/API calls — stub them out
jest.mock('./components/base/Base', () => ({
  __esModule: true,
  default: () => <div data-testid="base-data" />,
}));

jest.mock('./components/posts/table/Table', () => ({
  __esModule: true,
  default: () => <div data-testid="posts-table" />,
}));

jest.mock('./components/instagramPosts/table/Table', () => ({
  __esModule: true,
  default: () => <div data-testid="instagram-posts-table" />,
}));

jest.mock('./components/instagramReels/table/Table', () => ({
  __esModule: true,
  default: () => <div data-testid="instagram-reels-table" />,
}));

jest.mock('./components/ads/table/Table', () => ({
  __esModule: true,
  default: () => <div data-testid="ads-table" />,
}));

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeFacebookReport(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'report-1',
    competitorId: 'c-1',
    followers: 5000,
    posts: 120,
    postsImageCount: 60,
    postsVideoCount: 40,
    postsCarouselCount: 20,
    ads: 30,
    ads30d: 10,
    adsVideoCount: 15,
    adsImageCount: 10,
    adsCarouselCount: 3,
    adsDcoCount: 2,
    adsCtaWebsite: 20,
    adsCtaDirectMessage: 5,
    adsCtaInstagramPage: 3,
    adsCtaProduct: 1,
    adsCtaMetaPage: 1,
    topAdTexts: [
      { text: 'Buy now!', collationCount: 5, url: 'https://example.com/ad/1' },
      { text: 'Limited offer', collationCount: 3, url: null },
    ],
    topAds: [
      {
        adId: 'ad-1',
        title: 'Great Deal',
        format: 'IMAGE',
        url: 'https://example.com/ad/1',
        image: 'https://example.com/img.jpg',
        video: null,
        activeDays: 14,
      },
    ],
    topPostTexts: [],
    topPosts: [],
    fetchedAt: '2024-06-01T00:00:00.000Z',
    ...overrides,
  };
}

function makeCompetitor(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'c-1',
    name: 'Rival Co',
    facebookLink: 'https://facebook.com/rival',
    instagramLink: 'https://instagram.com/rival',
    facebookPageId: '123456789',
    isActive: true,
    businessId: 'biz-1',
    createdAt: new Date('2024-01-15'),
    instagramReport: null,
    facebookReport: null,
    ...overrides,
  };
}

function renderComponent() {
  return render(<Competitor />);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Competitor detail page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCompetitors = [];
  });

  // ── Back button ────────────────────────────────────────────────────────────

  it('renders the back button', () => {
    renderComponent();
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
  });

  it('calls navigate(-1) when the back button is clicked', () => {
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: /back/i }));

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  // ── Persistent child components ────────────────────────────────────────────

  it('always renders the BaseData block', () => {
    renderComponent();
    expect(screen.getByTestId('base-data')).toBeInTheDocument();
  });

  it('always renders the PostsTable', () => {
    renderComponent();
    expect(screen.getByTestId('posts-table')).toBeInTheDocument();
  });

  it('always renders the InstagramPostsTable', () => {
    renderComponent();
    expect(screen.getByTestId('instagram-posts-table')).toBeInTheDocument();
  });

  it('always renders the InstagramReelsTable', () => {
    renderComponent();
    expect(screen.getByTestId('instagram-reels-table')).toBeInTheDocument();
  });

  it('always renders the AdsTable', () => {
    renderComponent();
    expect(screen.getByTestId('ads-table')).toBeInTheDocument();
  });

  // ── Analytics blocks absent when facebookReport is null ───────────────────

  it('does not render "Posts Formats" heading when facebookReport is null', () => {
    mockCompetitors = [makeCompetitor({ facebookReport: null })];
    renderComponent();
    expect(screen.queryByText(/posts formats/i)).not.toBeInTheDocument();
  });

  it('does not render "Ads Formats" heading when facebookReport is null', () => {
    mockCompetitors = [makeCompetitor({ facebookReport: null })];
    renderComponent();
    expect(screen.queryByText(/ads formats/i)).not.toBeInTheDocument();
  });

  it('does not render "Ads CTA Types" heading when facebookReport is null', () => {
    mockCompetitors = [makeCompetitor({ facebookReport: null })];
    renderComponent();
    expect(screen.queryByText(/ads cta types/i)).not.toBeInTheDocument();
  });

  it('does not render "Top Ads" heading when facebookReport is null', () => {
    mockCompetitors = [makeCompetitor({ facebookReport: null })];
    renderComponent();
    expect(screen.queryByText(/^top ads$/i)).not.toBeInTheDocument();
  });

  it('does not render "Top Ad Texts" heading when facebookReport is null', () => {
    mockCompetitors = [makeCompetitor({ facebookReport: null })];
    renderComponent();
    expect(screen.queryByText(/top ad texts/i)).not.toBeInTheDocument();
  });

  // ── Analytics blocks absent when competitor not found ─────────────────────

  it('does not render analytics blocks when competitor is not in the store', () => {
    mockCompetitors = [];
    renderComponent();
    expect(screen.queryByText(/posts formats/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/ads formats/i)).not.toBeInTheDocument();
  });

  // ── Analytics blocks present when facebookReport has data ─────────────────

  it('renders "Posts Formats (90D)" heading when facebookReport exists', () => {
    mockCompetitors = [makeCompetitor({ facebookReport: makeFacebookReport() })];
    renderComponent();
    expect(screen.getByText(/posts formats \(90d\)/i)).toBeInTheDocument();
  });

  it('renders "Ads Formats" heading when facebookReport exists', () => {
    mockCompetitors = [makeCompetitor({ facebookReport: makeFacebookReport() })];
    renderComponent();
    expect(screen.getByText('Ads Formats')).toBeInTheDocument();
  });

  it('renders "Ads CTA Types" heading when facebookReport exists', () => {
    mockCompetitors = [makeCompetitor({ facebookReport: makeFacebookReport() })];
    renderComponent();
    expect(screen.getByText('Ads CTA Types')).toBeInTheDocument();
  });

  it('renders "Top Ads" heading when facebookReport has topAds', () => {
    mockCompetitors = [makeCompetitor({ facebookReport: makeFacebookReport() })];
    renderComponent();
    expect(screen.getByText('Top Ads')).toBeInTheDocument();
  });

  it('renders "Top Ad Texts" heading when facebookReport has topAdTexts', () => {
    mockCompetitors = [makeCompetitor({ facebookReport: makeFacebookReport() })];
    renderComponent();
    expect(screen.getByText('Top Ad Texts')).toBeInTheDocument();
  });

  // ── topAdTexts pre-processing ──────────────────────────────────────────────

  it('renders top ad text content from facebookReport', () => {
    mockCompetitors = [makeCompetitor({ facebookReport: makeFacebookReport() })];
    renderComponent();
    expect(screen.getByText('Buy now!')).toBeInTheDocument();
  });

  it('renders top ad texts sorted by collationCount descending', () => {
    const report = makeFacebookReport({
      topAdTexts: [
        { text: 'Less popular', collationCount: 1, url: null },
        { text: 'Most popular', collationCount: 10, url: null },
      ],
    });
    mockCompetitors = [makeCompetitor({ facebookReport: report })];
    renderComponent();

    const allText = screen.getAllByText(/most popular|less popular/i).map((el) => el.textContent);
    expect(allText[0]).toMatch(/most popular/i);
  });

  it('limits top ad texts to at most 6 entries', () => {
    const report = makeFacebookReport({
      topAdTexts: Array.from({ length: 10 }, (_, i) => ({
        text: `Ad text ${i + 1}`,
        collationCount: 10 - i,
        url: null,
      })),
    });
    mockCompetitors = [makeCompetitor({ facebookReport: report })];
    renderComponent();

    // Only the first 6 texts (by collationCount desc) should appear
    expect(screen.getByText('Ad text 1')).toBeInTheDocument();
    expect(screen.getByText('Ad text 6')).toBeInTheDocument();
    expect(screen.queryByText('Ad text 7')).not.toBeInTheDocument();
  });

  // ── Competitor matched by URL id param ────────────────────────────────────

  it('uses the competitor whose id matches the URL param', () => {
    // Only the competitor with id 'c-1' should be matched (useParams returns id: 'c-1')
    mockCompetitors = [
      makeCompetitor({ id: 'c-99', name: 'Wrong Competitor', facebookReport: makeFacebookReport() }),
      makeCompetitor({ id: 'c-1', name: 'Correct Competitor', facebookReport: makeFacebookReport() }),
    ];
    renderComponent();

    // TopAdTexts renders competitorName — verify it's the correct one
    expect(screen.getAllByText('Correct Competitor').length).toBeGreaterThan(0);
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import Competitors from './Competitors';

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('react-toastify', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ businessId: 'biz-1' }),
  useNavigate: () => jest.fn(),
}));

const mockGetCompetitors = jest.fn();
const mockDeleteCompetitor = jest.fn();

jest.mock('../../../../../../store/competitor/competitorApi', () => ({
  useGetCompetitorsMutation: () => [mockGetCompetitors, { isLoading: false }],
  useDeleteCompetitorMutation: () => [mockDeleteCompetitor, { isLoading: false }],
}));

const mockDispatch = jest.fn();

jest.mock('../../../../../../store/hooks', () => ({
  useAppDispatch: () => mockDispatch,
}));

let mockCompetitors: any[] = [];

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: (selector: (state: unknown) => unknown) =>
    selector({ competitorModule: { competitors: mockCompetitors } }),
}));

jest.mock('../../../../../../store/competitor/competitorSlice', () => ({
  setCompetitors: (data: unknown) => ({ type: 'competitor/setCompetitors', payload: data }),
}));

jest.mock('./:id/components/base/createCompetitorDlg/CreateCompetitorDlg', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../../../../../../components/confirmDlg/ConfirmDlg', () => ({
  confirm: jest.fn(),
}));

jest.mock('../../../../../../utils/showError', () => ({
  showError: jest.fn(),
}));

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeCompetitor(overrides: Partial<{
  id: string;
  name: string;
  facebookLink: string;
  instagramLink: string;
  facebookPageId: string;
  isActive: boolean;
  businessId: string;
  createdAt: Date;
}> = {}) {
  return {
    id: 'c-1',
    name: 'Rival Co',
    facebookLink: 'https://facebook.com/rival',
    instagramLink: 'https://instagram.com/rival',
    facebookPageId: undefined as string | undefined,
    isActive: true,
    businessId: 'biz-1',
    createdAt: new Date('2024-01-15'),
    ...overrides,
  };
}

function renderComponent() {
  return render(<Competitors />);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Competitors list', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCompetitors = [];
    mockGetCompetitors.mockReturnValue({
      unwrap: () => Promise.resolve({ data: [] }),
    });
  });

  // ── Column headers ─────────────────────────────────────────────────────────

  it('renders the "Competitors" heading', () => {
    renderComponent();
    expect(screen.getByRole('heading', { name: /competitors/i })).toBeInTheDocument();
  });

  it('renders the Instagram column header', () => {
    renderComponent();
    expect(screen.getByRole('columnheader', { name: /instagram/i })).toBeInTheDocument();
  });

  it('renders the Facebook column header', () => {
    renderComponent();
    expect(screen.getByRole('columnheader', { name: /facebook/i })).toBeInTheDocument();
  });

  it('renders the Name column header', () => {
    renderComponent();
    expect(screen.getByRole('columnheader', { name: /name/i })).toBeInTheDocument();
  });

  it('renders the Active column header', () => {
    renderComponent();
    expect(screen.getByRole('columnheader', { name: /active/i })).toBeInTheDocument();
  });

  // ── Empty state ────────────────────────────────────────────────────────────

  it('shows "No data" when the competitors list is empty', () => {
    mockCompetitors = [];
    renderComponent();
    expect(screen.getByText(/no data/i)).toBeInTheDocument();
  });

  // ── Row data ───────────────────────────────────────────────────────────────

  it('renders the competitor name in the table', () => {
    mockCompetitors = [makeCompetitor()];
    renderComponent();
    expect(screen.getByText('Rival Co')).toBeInTheDocument();
  });

  it('renders the Instagram Link as a link with correct href', () => {
    mockCompetitors = [makeCompetitor({ instagramLink: 'https://instagram.com/rival' })];
    renderComponent();

    const links = screen.getAllByRole('link');
    const igLink = links.find(
      (l) => l.getAttribute('href') === 'https://instagram.com/rival'
    );
    expect(igLink).toBeInTheDocument();
    expect(igLink).toHaveTextContent('Instagram');
  });

  it('renders the Facebook Link as a link with correct href', () => {
    mockCompetitors = [makeCompetitor({ facebookLink: 'https://facebook.com/rival' })];
    renderComponent();

    const links = screen.getAllByRole('link');
    const fbLink = links.find(
      (l) => l.getAttribute('href') === 'https://facebook.com/rival'
    );
    expect(fbLink).toBeInTheDocument();
    expect(fbLink).toHaveTextContent('Facebook');
  });

  it('renders "Yes" badge for an active competitor', () => {
    mockCompetitors = [makeCompetitor({ isActive: true })];
    renderComponent();
    expect(screen.getByText('Yes')).toBeInTheDocument();
  });

  it('renders "No" badge for an inactive competitor', () => {
    mockCompetitors = [makeCompetitor({ isActive: false })];
    renderComponent();
    expect(screen.getByText('No')).toBeInTheDocument();
  });

  it('renders a row for each competitor in the list', () => {
    mockCompetitors = [
      makeCompetitor({ id: 'c-1', name: 'Rival A' }),
      makeCompetitor({ id: 'c-2', name: 'Rival B' }),
    ];
    renderComponent();
    expect(screen.getByText('Rival A')).toBeInTheDocument();
    expect(screen.getByText('Rival B')).toBeInTheDocument();
  });

  // ── Meta Ads Library column ────────────────────────────────────────────────

  it('renders the "Meta Ads Library" column header', () => {
    renderComponent();
    expect(screen.getByRole('columnheader', { name: /meta ads library/i })).toBeInTheDocument();
  });

  it('renders the Ads Library link with the correct Facebook Ads Library URL when facebookPageId is set', () => {
    mockCompetitors = [makeCompetitor({ facebookPageId: '123456789' })];
    renderComponent();

    const link = screen.getByRole('link', { name: /ads library/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      'href',
      'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=UA&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=123456789'
    );
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('does not render the Ads Library link when facebookPageId is absent', () => {
    mockCompetitors = [makeCompetitor({ facebookPageId: undefined })];
    renderComponent();

    expect(screen.queryByRole('link', { name: /ads library/i })).not.toBeInTheDocument();
  });

  // ── Add button ─────────────────────────────────────────────────────────────

  it('renders the "Add Competitors" button', () => {
    renderComponent();
    expect(screen.getByRole('button', { name: /add competitors/i })).toBeInTheDocument();
  });
});

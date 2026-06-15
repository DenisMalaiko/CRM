import React from 'react';
import { render, screen } from '@testing-library/react';
import BaseData from './Base';

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('react-toastify', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: 'competitor-1', businessId: 'biz-1' }),
  useNavigate: () => jest.fn(),
}));

const mockGetCompetitor = jest.fn();

jest.mock('../../../../../../../../../store/competitor/competitorApi', () => ({
  useGetCompetitorMutation: () => [mockGetCompetitor, { isLoading: false }],
}));

const mockDispatch = jest.fn();

jest.mock('../../../../../../../../../store/hooks', () => ({
  useAppDispatch: () => mockDispatch,
}));

let mockCompetitor: any = null;

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: (selector: (state: unknown) => unknown) =>
    selector({ competitorModule: { competitor: mockCompetitor } }),
}));

jest.mock('../../../../../../../../../store/competitor/competitorSlice', () => ({
  setCompetitor: (data: unknown) => ({ type: 'competitor/setCompetitor', payload: data }),
}));

jest.mock('./createCompetitorDlg/CreateCompetitorDlg', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../../../../../../../../../utils/showError', () => ({
  showError: jest.fn(),
}));

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeCompetitor(overrides: Partial<{
  id: string;
  name: string;
  facebookLink: string;
  instagramLink: string;
  isActive: boolean;
  businessId: string;
  createdAt: Date;
}> = {}) {
  return {
    id: 'competitor-1',
    name: 'Rival Co',
    facebookLink: 'https://facebook.com/rival',
    instagramLink: 'https://instagram.com/rival',
    isActive: true,
    businessId: 'biz-1',
    createdAt: new Date('2024-01-15'),
    ...overrides,
  };
}

function renderComponent() {
  return render(<BaseData />);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('BaseData (Competitor detail)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCompetitor = null;
    mockGetCompetitor.mockReturnValue({
      unwrap: () => Promise.resolve({ data: null }),
    });
  });

  // ── Loading / null state ───────────────────────────────────────────────────

  it('shows "None" when no competitor is loaded', () => {
    mockCompetitor = null;
    renderComponent();
    expect(screen.getByText('None')).toBeInTheDocument();
  });

  // ── Row labels ─────────────────────────────────────────────────────────────

  it('renders the "Instagram Link" row label when a competitor is loaded', () => {
    mockCompetitor = makeCompetitor();
    renderComponent();
    expect(screen.getByText('Instagram Link')).toBeInTheDocument();
  });

  it('renders the "Facebook Link" row label when a competitor is loaded', () => {
    mockCompetitor = makeCompetitor();
    renderComponent();
    expect(screen.getByText('Facebook Link')).toBeInTheDocument();
  });

  it('renders the "Name" row label when a competitor is loaded', () => {
    mockCompetitor = makeCompetitor();
    renderComponent();
    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  // ── Instagram Link display ─────────────────────────────────────────────────

  it('renders the Instagram Link as a link with correct href', () => {
    mockCompetitor = makeCompetitor({ instagramLink: 'https://instagram.com/rival' });
    renderComponent();

    const links = screen.getAllByRole('link');
    const igLink = links.find(
      (l) => l.getAttribute('href') === 'https://instagram.com/rival'
    );
    expect(igLink).toBeInTheDocument();
    expect(igLink).toHaveTextContent('https://instagram.com/rival');
  });

  it('renders the Facebook Link as a link with correct href', () => {
    mockCompetitor = makeCompetitor({ facebookLink: 'https://facebook.com/rival' });
    renderComponent();

    const links = screen.getAllByRole('link');
    const fbLink = links.find(
      (l) => l.getAttribute('href') === 'https://facebook.com/rival'
    );
    expect(fbLink).toBeInTheDocument();
    expect(fbLink).toHaveTextContent('https://facebook.com/rival');
  });

  it('renders the competitor name', () => {
    mockCompetitor = makeCompetitor({ name: 'Rival Co' });
    renderComponent();
    expect(screen.getByText('Rival Co')).toBeInTheDocument();
  });

  // ── Active badge ───────────────────────────────────────────────────────────

  it('renders "Yes" badge for an active competitor', () => {
    mockCompetitor = makeCompetitor({ isActive: true });
    renderComponent();
    expect(screen.getByText('Yes')).toBeInTheDocument();
  });

  it('renders "No" badge for an inactive competitor', () => {
    mockCompetitor = makeCompetitor({ isActive: false });
    renderComponent();
    expect(screen.getByText('No')).toBeInTheDocument();
  });

  // ── Edit button ────────────────────────────────────────────────────────────

  it('renders the "Edit Competitor" button', () => {
    mockCompetitor = makeCompetitor();
    renderComponent();
    expect(screen.getByRole('button', { name: /edit competitor/i })).toBeInTheDocument();
  });
});

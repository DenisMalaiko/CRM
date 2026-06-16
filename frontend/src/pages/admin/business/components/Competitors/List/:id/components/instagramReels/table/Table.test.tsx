import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InstagramReelsTable from './Table';

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: 'competitor-1' }),
}));

jest.mock('react-toastify', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const mockGetInstagramReels = jest.fn();

jest.mock('../../../../../../../../../../store/competitor/competitorApi', () => ({
  useGetInstagramReelsMutation: () => [mockGetInstagramReels, { isLoading: false }],
}));

const mockDispatch = jest.fn();

jest.mock('../../../../../../../../../../store/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({ competitorModule: { instagramReels: mockInstagramReels } }),
}));

let mockInstagramReels: any[] = [];

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: (selector: (state: unknown) => unknown) =>
    selector({ competitorModule: { instagramReels: mockInstagramReels } }),
}));

jest.mock('../../../../../../../../../../store/competitor/competitorSlice', () => ({
  setInstagramReels: (data: unknown) => ({ type: 'competitor/setInstagramReels', payload: data }),
}));

jest.mock('../../../../../../../../../../utils/showError', () => ({
  showError: jest.fn(),
}));

// Stub child dialogs — their own tests cover them
jest.mock('../fetchInstagramReelsDlg/FetchInstagramReelsDlg', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../../../../../../../../../../components/textDlg/TextDlg', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../../../../../../../../../../components/sliderDlg/SliderDlg', () => ({
  __esModule: true,
  default: () => null,
}));

// useCopyToClipboard uses navigator.clipboard which is unavailable in jsdom
jest.mock('../../../../../../../../../../hooks/useCopyToClipboard', () => ({
  useCopyToClipboard: () => ({ copy: jest.fn(), copied: false }),
}));

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeReel(overrides: Record<string, any> = {}) {
  return {
    id: 'reel-1',
    text: 'Sample instagram reel text',
    platform: 'Instagram',
    likes: 100,
    comments: 10,
    postedAt: '2024-03-15T10:00:00Z',
    url: 'https://instagram.com/reel/abc123',
    media: [],
    ...overrides,
  };
}

function renderComponent() {
  return render(<InstagramReelsTable />);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('InstagramReelsTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInstagramReels = [];
    mockGetInstagramReels.mockReturnValue({
      unwrap: () => Promise.resolve({ data: [] }),
    });
  });

  // ── Default render ─────────────────────────────────────────────────────────

  describe('default render', () => {
    it('renders the "Instagram Reels" heading', () => {
      renderComponent();
      expect(screen.getByText('Instagram Reels')).toBeInTheDocument();
    });

    it('renders the "Get Instagram Reels" button', () => {
      renderComponent();
      expect(screen.getByRole('button', { name: /get instagram reels/i })).toBeInTheDocument();
    });

    it('renders table column headers', () => {
      renderComponent();
      expect(screen.getByText(/^media$/i)).toBeInTheDocument();
      expect(screen.getByText(/^text$/i)).toBeInTheDocument();
      expect(screen.getByText(/^platform$/i)).toBeInTheDocument();
      expect(screen.getByText(/^post url$/i)).toBeInTheDocument();
    });

    it('renders pagination controls', () => {
      renderComponent();
      expect(screen.getByRole('button', { name: /prev/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    });
  });

  // ── Empty state ────────────────────────────────────────────────────────────

  describe('empty state', () => {
    it('shows "No data" when instagramReels is an empty array', () => {
      mockInstagramReels = [];
      renderComponent();
      expect(screen.getByText(/no data/i)).toBeInTheDocument();
    });

    it('disables both pagination buttons when there are no reels', () => {
      mockInstagramReels = [];
      renderComponent();
      expect(screen.getByRole('button', { name: /prev/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
    });
  });

  // ── Data rendering ─────────────────────────────────────────────────────────

  describe('data rendering', () => {
    it('renders reel text in the table row', () => {
      mockInstagramReels = [makeReel({ text: 'Hello Instagram reels world' })];
      renderComponent();
      expect(screen.getByText('Hello Instagram reels world')).toBeInTheDocument();
    });

    it('renders platform name in the table row', () => {
      mockInstagramReels = [makeReel({ platform: 'Instagram' })];
      renderComponent();
      expect(screen.getByText('Instagram')).toBeInTheDocument();
    });

    it('renders likes count in the table row', () => {
      mockInstagramReels = [makeReel({ likes: 500 })];
      renderComponent();
      expect(screen.getByText('500')).toBeInTheDocument();
    });

    it('renders comments count in the table row', () => {
      mockInstagramReels = [makeReel({ comments: 33 })];
      renderComponent();
      expect(screen.getByText('33')).toBeInTheDocument();
    });

    it('renders a link to the reel url', () => {
      mockInstagramReels = [makeReel({ url: 'https://instagram.com/reel/abc123' })];
      renderComponent();
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', 'https://instagram.com/reel/abc123');
    });

    it('renders "No media" when reel has no media', () => {
      mockInstagramReels = [makeReel({ media: [] })];
      renderComponent();
      expect(screen.getByText(/no media/i)).toBeInTheDocument();
    });

    it('renders multiple rows when multiple reels are present', () => {
      mockInstagramReels = [
        makeReel({ id: 'reel-1', text: 'First reel' }),
        makeReel({ id: 'reel-2', text: 'Second reel' }),
      ];
      renderComponent();
      expect(screen.getByText('First reel')).toBeInTheDocument();
      expect(screen.getByText('Second reel')).toBeInTheDocument();
    });
  });

  // ── Media rendering ────────────────────────────────────────────────────────

  describe('media rendering', () => {
    it('renders a video element when media has a url', () => {
      mockInstagramReels = [
        makeReel({ media: [{ url: 'https://example.com/video.mp4', thumbnail: null }] }),
      ];
      renderComponent();
      expect(document.querySelector('video')).toBeInTheDocument();
    });

    it('renders an img element when media has a thumbnail but no url', () => {
      mockInstagramReels = [
        makeReel({ media: [{ url: null, thumbnail: 'https://example.com/thumb.jpg' }] }),
      ];
      renderComponent();
      expect(document.querySelector('img')).toBeInTheDocument();
    });
  });

  // ── Sorting ────────────────────────────────────────────────────────────────

  describe('column sorting', () => {
    it('shows ↓ on the "Posted At" header by default (initial sort)', () => {
      mockInstagramReels = [makeReel()];
      renderComponent();
      expect(screen.getByText(/posted at.*↓/i)).toBeInTheDocument();
    });

    it('clicking "Likes" header shows ↓ sort indicator', () => {
      mockInstagramReels = [makeReel()];
      renderComponent();

      userEvent.click(screen.getByText(/^likes/i));
      expect(screen.getByText(/likes.*↓/i)).toBeInTheDocument();
    });

    it('clicking "Likes" header twice toggles to ↑ sort indicator', () => {
      mockInstagramReels = [makeReel()];
      renderComponent();

      userEvent.click(screen.getByText(/^likes/i));
      userEvent.click(screen.getByText(/likes.*↓/i));
      expect(screen.getByText(/likes.*↑/i)).toBeInTheDocument();
    });

    it('clicking "Comments" header shows ↓ sort indicator', () => {
      mockInstagramReels = [makeReel()];
      renderComponent();

      userEvent.click(screen.getByText(/^comments/i));
      expect(screen.getByText(/comments.*↓/i)).toBeInTheDocument();
    });

    it('sorts reels by likes descending when Likes header is clicked', () => {
      mockInstagramReels = [
        makeReel({ id: 'reel-1', text: 'Low likes', likes: 10 }),
        makeReel({ id: 'reel-2', text: 'High likes', likes: 999 }),
      ];
      renderComponent();

      userEvent.click(screen.getByText(/^likes/i));

      const rows = screen.getAllByRole('row');
      // First data row (index 1, skipping thead) should be the high-likes reel
      expect(rows[1]).toHaveTextContent('High likes');
    });
  });

  // ── Pagination ─────────────────────────────────────────────────────────────

  describe('pagination', () => {
    it('disables Prev button on first page', () => {
      mockInstagramReels = [makeReel()];
      renderComponent();
      expect(screen.getByRole('button', { name: /prev/i })).toBeDisabled();
    });

    it('enables Next button when there are more items than the page size', () => {
      mockInstagramReels = Array.from({ length: 6 }, (_, i) =>
        makeReel({ id: `reel-${i}`, text: `Reel ${i}` })
      );
      renderComponent();
      expect(screen.getByRole('button', { name: /next/i })).not.toBeDisabled();
    });

    it('navigates to page 2 when Next is clicked', () => {
      mockInstagramReels = Array.from({ length: 6 }, (_, i) =>
        makeReel({ id: `reel-${i}`, text: `Reel ${i}` })
      );
      renderComponent();

      userEvent.click(screen.getByRole('button', { name: /next/i }));
      expect(screen.getByText(/page 2 of 2/i)).toBeInTheDocument();
    });

    it('shows only page-size items on first page when more items exist', () => {
      mockInstagramReels = Array.from({ length: 7 }, (_, i) =>
        makeReel({ id: `reel-${i}`, text: `Reel ${i}` })
      );
      renderComponent();

      // 5 data rows + 1 header row = 6 rows total
      const rows = screen.getAllByRole('row');
      expect(rows).toHaveLength(6);
    });
  });

  // ── Initial data fetch ─────────────────────────────────────────────────────

  describe('initial data fetch', () => {
    it('dispatches setInstagramReels with data returned from the API on mount', async () => {
      const reels = [makeReel()];
      mockGetInstagramReels.mockReturnValue({
        unwrap: () => Promise.resolve({ data: reels }),
      });

      renderComponent();

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith({
          type: 'competitor/setInstagramReels',
          payload: reels,
        });
      });
    });

    it('calls showError when the initial fetch rejects', async () => {
      const { showError } = require('../../../../../../../../../../utils/showError');
      const fetchError = new Error('Network error');
      mockGetInstagramReels.mockReturnValue({
        unwrap: () => Promise.reject(fetchError),
      });

      renderComponent();

      await waitFor(() => {
        expect(showError).toHaveBeenCalledWith(fetchError);
      });
    });
  });
});

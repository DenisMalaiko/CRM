import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FetchInstagramPostsDlg from './FetchInstagramPostsDlg';

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: 'competitor-1' }),
}));

jest.mock('react-toastify', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const mockFetchInstagramPosts = jest.fn();
const mockGetInstagramPosts = jest.fn();

let mockIsLoadingPosts = false;

jest.mock('../../../../../../../../../../store/competitor/competitorApi', () => ({
  useFetchInstagramPostsMutation: () => [mockFetchInstagramPosts, { isLoading: mockIsLoadingPosts }],
  useGetInstagramPostsMutation: () => [mockGetInstagramPosts, { isLoading: false }],
}));

const mockDispatch = jest.fn();

jest.mock('../../../../../../../../../../store/hooks', () => ({
  useAppDispatch: () => mockDispatch,
}));

jest.mock('../../../../../../../../../../store/competitor/competitorSlice', () => ({
  setInstagramPosts: (data: unknown) => ({ type: 'competitor/setInstagramPosts', payload: data }),
}));

jest.mock('../../../../../../../../../../utils/showError', () => ({
  showError: jest.fn(),
}));

// Stub DatePicker — avoids complex calendar DOM in unit tests
jest.mock('react-datepicker', () => {
  const MockDatePicker = ({ onChange, selected, className }: any) => (
    <input
      data-testid="date-picker"
      type="text"
      className={className}
      defaultValue={selected ? selected.toISOString().slice(0, 10) : ''}
      readOnly
    />
  );
  return MockDatePicker;
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function renderDialog(props: { open?: boolean; onClose?: () => void } = {}) {
  const defaults = { open: true, onClose: jest.fn() };
  return render(<FetchInstagramPostsDlg {...defaults} {...props} />);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('FetchInstagramPostsDlg', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsLoadingPosts = false;
    mockFetchInstagramPosts.mockReturnValue({
      unwrap: () => Promise.resolve({ data: { id: 'job-1' }, message: 'Fetched successfully' }),
    });
    mockGetInstagramPosts.mockReturnValue({
      unwrap: () => Promise.resolve({ data: [] }),
    });
  });

  // ── Visibility ─────────────────────────────────────────────────────────────

  describe('visibility', () => {
    it('renders the dialog when open is true', () => {
      renderDialog({ open: true });
      expect(screen.getByText('Params')).toBeInTheDocument();
    });

    it('does not render the dialog when open is false', () => {
      renderDialog({ open: false });
      expect(screen.queryByText('Params')).not.toBeInTheDocument();
    });
  });

  // ── Default render ─────────────────────────────────────────────────────────

  describe('default render', () => {
    it('renders the "Params" heading', () => {
      renderDialog();
      expect(screen.getByText('Params')).toBeInTheDocument();
    });

    it('renders the "Only Posts Newer Than" label', () => {
      renderDialog();
      expect(screen.getByText(/only posts newer than/i)).toBeInTheDocument();
    });

    it('renders the date picker', () => {
      renderDialog();
      expect(screen.getByTestId('date-picker')).toBeInTheDocument();
    });

    it('renders a "Get" submit button', () => {
      renderDialog();
      expect(screen.getByRole('button', { name: /^get$/i })).toBeInTheDocument();
    });

    it('renders a "Cancel" button', () => {
      renderDialog();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });
  });

  // ── Close behaviour ────────────────────────────────────────────────────────

  describe('close behaviour', () => {
    it('calls onClose when Cancel button is clicked', () => {
      const onClose = jest.fn();
      renderDialog({ onClose });

      userEvent.click(screen.getByRole('button', { name: /cancel/i }));

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when the X icon button is clicked', () => {
      const onClose = jest.fn();
      renderDialog({ onClose });

      // X button is the one that is neither Cancel nor Get
      const buttons = screen.getAllByRole('button');
      const closeButton = buttons.find(
        (btn) => !btn.textContent?.match(/cancel|get/i)
      );
      expect(closeButton).toBeDefined();
      userEvent.click(closeButton!);

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  // ── Button states ──────────────────────────────────────────────────────────

  describe('button states', () => {
    it('Cancel and Get buttons are enabled when not loading', () => {
      renderDialog();
      expect(screen.getByRole('button', { name: /cancel/i })).not.toBeDisabled();
      expect(screen.getByRole('button', { name: /^get$/i })).not.toBeDisabled();
    });
  });

  // ── Form submission ────────────────────────────────────────────────────────

  describe('form submission', () => {
    it('calls fetchInstagramPosts with the competitor id and form data on submit', async () => {
      renderDialog();

      userEvent.click(screen.getByRole('button', { name: /^get$/i }));

      await waitFor(() => {
        expect(mockFetchInstagramPosts).toHaveBeenCalledWith(
          expect.objectContaining({ id: 'competitor-1' })
        );
      });
    });

    it('fetches updated posts and dispatches setInstagramPosts after successful submission', async () => {
      const freshPosts = [{ id: 'p-1', text: 'New post' }];
      mockGetInstagramPosts.mockReturnValue({
        unwrap: () => Promise.resolve({ data: freshPosts }),
      });

      renderDialog();
      userEvent.click(screen.getByRole('button', { name: /^get$/i }));

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith({
          type: 'competitor/setInstagramPosts',
          payload: freshPosts,
        });
      });
    });

    it('shows a success toast after successful submission', async () => {
      const { toast } = require('react-toastify');

      renderDialog();
      userEvent.click(screen.getByRole('button', { name: /^get$/i }));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Fetched successfully');
      });
    });

    it('calls onClose after successful submission', async () => {
      const onClose = jest.fn();
      renderDialog({ onClose });

      userEvent.click(screen.getByRole('button', { name: /^get$/i }));

      await waitFor(() => {
        expect(onClose).toHaveBeenCalledTimes(1);
      });
    });

    it('calls showError when the API call rejects', async () => {
      const { showError } = require('../../../../../../../../../../utils/showError');
      const apiError = new Error('API failure');
      mockFetchInstagramPosts.mockReturnValue({
        unwrap: () => Promise.reject(apiError),
      });

      renderDialog();
      userEvent.click(screen.getByRole('button', { name: /^get$/i }));

      await waitFor(() => {
        expect(showError).toHaveBeenCalledWith(apiError);
      });
    });

    it('does not call onClose when the API returns no data', async () => {
      const onClose = jest.fn();
      mockFetchInstagramPosts.mockReturnValue({
        unwrap: () => Promise.resolve({ data: null, message: null }),
      });

      renderDialog({ onClose });
      userEvent.click(screen.getByRole('button', { name: /^get$/i }));

      await waitFor(() => {
        expect(mockFetchInstagramPosts).toHaveBeenCalled();
      });
      expect(onClose).not.toHaveBeenCalled();
    });
  });
});

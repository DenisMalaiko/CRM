import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateCompetitorDlg from './CreateCompetitorDlg';

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('react-toastify', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ businessId: 'biz-1' }),
}));

const mockCreateCompetitor = jest.fn();
const mockUpdateCompetitor = jest.fn();
const mockGetCompetitors = jest.fn();
const mockGetCompetitor = jest.fn();

jest.mock('../../../../../../../../../../store/competitor/competitorApi', () => ({
  useCreateCompetitorMutation: () => [mockCreateCompetitor, { isLoading: false }],
  useUpdateCompetitorMutation: () => [mockUpdateCompetitor, { isLoading: false }],
  useGetCompetitorsMutation: () => [mockGetCompetitors, { isLoading: false }],
  useGetCompetitorMutation: () => [mockGetCompetitor, { isLoading: false }],
}));

const mockDispatch = jest.fn();

jest.mock('../../../../../../../../../../store/hooks', () => ({
  useAppDispatch: () => mockDispatch,
}));

jest.mock('../../../../../../../../../../store/competitor/competitorSlice', () => ({
  setCompetitors: (data: unknown) => ({ type: 'competitor/setCompetitors', payload: data }),
  setCompetitor: (data: unknown) => ({ type: 'competitor/setCompetitor', payload: data }),
}));

jest.mock('../../../../../../../../../../utils/showError', () => ({
  showError: jest.fn(),
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

function renderDialog(props: { open?: boolean; onClose?: () => void; competitor?: any } = {}) {
  const defaults = { open: true, onClose: jest.fn(), competitor: null };
  return render(<CreateCompetitorDlg {...defaults} {...props} />);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('CreateCompetitorDlg', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCompetitors.mockReturnValue({
      unwrap: () => Promise.resolve({ data: [] }),
    });
    mockCreateCompetitor.mockReturnValue({
      unwrap: () => Promise.resolve({ data: { id: 'c-1' }, message: 'Created' }),
    });
    mockUpdateCompetitor.mockReturnValue({
      unwrap: () => Promise.resolve({ data: { id: 'c-1' }, message: 'Updated' }),
    });
    mockGetCompetitor.mockReturnValue({
      unwrap: () => Promise.resolve({ data: { id: 'c-1' } }),
    });
  });

  // ── Render ─────────────────────────────────────────────────────────────────

  it('renders the dialog when open is true', () => {
    renderDialog();
    expect(screen.getByText('Create Competitor')).toBeInTheDocument();
  });

  it('does not render the dialog when open is false', () => {
    renderDialog({ open: false });
    expect(screen.queryByText('Create Competitor')).not.toBeInTheDocument();
  });

  it('renders the Instagram Link label', () => {
    renderDialog();
    expect(screen.getByText('Instagram Link')).toBeInTheDocument();
  });

  it('renders the Facebook Link label', () => {
    renderDialog();
    expect(screen.getByText('Facebook Link')).toBeInTheDocument();
  });

  it('renders the Instagram Link input with correct placeholder', () => {
    renderDialog();
    expect(screen.getByPlaceholderText('Enter instagram link')).toBeInTheDocument();
  });

  // ── Create mode ────────────────────────────────────────────────────────────

  it('shows "Create Competitor" heading in create mode', () => {
    renderDialog({ competitor: null });
    expect(screen.getByText('Create Competitor')).toBeInTheDocument();
  });

  it('initialises the Instagram Link input as empty in create mode', () => {
    renderDialog();
    const input = screen.getByPlaceholderText('Enter instagram link') as HTMLInputElement;
    expect(input.value).toBe('');
  });

  // ── Edit mode ──────────────────────────────────────────────────────────────

  it('shows "Edit Competitor" heading when a competitor is passed', () => {
    const competitor = {
      id: 'c-1',
      name: 'Rival Co',
      facebookLink: 'https://facebook.com/rival',
      instagramLink: 'https://instagram.com/rival',
      isActive: true,
      businessId: 'biz-1',
    };
    renderDialog({ competitor });
    expect(screen.getByText('Edit Competitor')).toBeInTheDocument();
  });

  it('pre-populates the Instagram Link field with the competitor value', () => {
    const competitor = {
      id: 'c-1',
      name: 'Rival Co',
      facebookLink: 'https://facebook.com/rival',
      instagramLink: 'https://instagram.com/rival',
      isActive: true,
      businessId: 'biz-1',
    };
    renderDialog({ competitor });
    const input = screen.getByPlaceholderText('Enter instagram link') as HTMLInputElement;
    expect(input.value).toBe('https://instagram.com/rival');
  });

  it('pre-populates the Facebook Link field with the competitor value', () => {
    const competitor = {
      id: 'c-1',
      name: 'Rival Co',
      facebookLink: 'https://facebook.com/rival',
      instagramLink: 'https://instagram.com/rival',
      isActive: true,
      businessId: 'biz-1',
    };
    renderDialog({ competitor });
    const input = screen.getByPlaceholderText('Enter facebook link') as HTMLInputElement;
    expect(input.value).toBe('https://facebook.com/rival');
  });

  // ── Validation ─────────────────────────────────────────────────────────────

  it('shows validation errors when form is submitted with all empty fields', async () => {
    renderDialog();

    userEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      const errors = screen.getAllByText(/this field is required/i);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  // ── User interaction ───────────────────────────────────────────────────────

  it('updates the Instagram Link input value as the user types', async () => {
    renderDialog();

    const input = screen.getByPlaceholderText('Enter instagram link');
    userEvent.type(input, 'https://instagram.com/test');

    expect((input as HTMLInputElement).value).toBe('https://instagram.com/test');
  });

  it('includes the Instagram Link value in the createCompetitor payload on submit', async () => {
    renderDialog();

    userEvent.type(screen.getByPlaceholderText('Enter name'), 'Rival Co');
    userEvent.type(screen.getByPlaceholderText('Enter facebook link'), 'https://facebook.com/rival');
    userEvent.type(screen.getByPlaceholderText('Enter instagram link'), 'https://instagram.com/rival');

    userEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockCreateCompetitor).toHaveBeenCalled();
      const payload = mockCreateCompetitor.mock.calls[0][0];
      expect(payload).toMatchObject({ instagramLink: 'https://instagram.com/rival' });
    });
  });

  it('includes the Instagram Link value in the updateCompetitor payload on submit when editing', async () => {
    const competitor = {
      id: 'c-1',
      name: 'Rival Co',
      facebookLink: 'https://facebook.com/rival',
      instagramLink: 'https://instagram.com/rival',
      isActive: true,
      businessId: 'biz-1',
    };
    renderDialog({ competitor });

    const input = screen.getByPlaceholderText('Enter instagram link');
    userEvent.clear(input);
    userEvent.type(input, 'https://instagram.com/updated');

    userEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockUpdateCompetitor).toHaveBeenCalled();
      const payload = mockUpdateCompetitor.mock.calls[0][0];
      expect(payload.form).toMatchObject({ instagramLink: 'https://instagram.com/updated' });
    });
  });

  // ── Close ──────────────────────────────────────────────────────────────────

  it('calls onClose when the cancel button is clicked', () => {
    const onClose = jest.fn();
    renderDialog({ onClose });

    userEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the ✕ button is clicked', () => {
    const onClose = jest.fn();
    renderDialog({ onClose });

    userEvent.click(screen.getByRole('button', { name: /✕/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

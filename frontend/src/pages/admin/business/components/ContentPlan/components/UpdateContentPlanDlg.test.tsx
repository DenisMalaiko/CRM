import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UpdateContentPlanDlg from './UpdateContentPlanDlg';
import { ContentPlanStatus } from '../../../../../../enum/ContentPlanStatus';
import { TContentPlan } from '../../../../../../models/ContentPlan';

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('react-toastify', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ businessId: 'biz-1' }),
}));

const mockUpdateContentPlan = jest.fn();
const mockGetContentPlans = jest.fn();

jest.mock('../../../../../../store/contentPlan/contentPlanApi', () => ({
  useUpdateContentPlanMutation: () => [mockUpdateContentPlan, { isLoading: false }],
  useLazyGetContentPlansQuery: () => [mockGetContentPlans, { isLoading: false }],
}));

const mockDispatch = jest.fn();

jest.mock('../../../../../../store/hooks', () => ({
  useAppDispatch: () => mockDispatch,
}));

jest.mock('../../../../../../store/contentPlan/contentPlanSlice', () => ({
  setContentPlans: (d: unknown) => ({ type: 'contentPlan/setContentPlans', payload: d }),
}));

jest.mock('../../../../../../utils/showError', () => ({
  showError: jest.fn(),
}));

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makePlan(overrides: Partial<TContentPlan> = {}): TContentPlan {
  return {
    id: 'plan-1',
    businessId: 'biz-1',
    title: 'Q1 Plan',
    description: 'A description',
    status: ContentPlanStatus.Draft,
    mode: 'manual',
    createdAt: new Date('2024-01-01'),
    ...overrides,
  };
}

function renderDialog(props: {
  open?: boolean;
  onClose?: () => void;
  contentPlan?: TContentPlan | null;
} = {}) {
  const defaults = { open: true, onClose: jest.fn(), contentPlan: makePlan() };
  return render(<UpdateContentPlanDlg {...defaults} {...props} />);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('UpdateContentPlanDlg', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetContentPlans.mockReturnValue({
      unwrap: () => Promise.resolve({ data: [] }),
    });
    mockUpdateContentPlan.mockReturnValue({
      unwrap: () => Promise.resolve({ data: { id: 'plan-1' }, message: 'Updated' }),
    });
  });

  // ── Visibility ─────────────────────────────────────────────────────────────

  it('renders the dialog when open is true', () => {
    renderDialog();
    expect(screen.getByText('Edit Content Plan')).toBeInTheDocument();
  });

  it('does not render the dialog when open is false', () => {
    renderDialog({ open: false });
    expect(screen.queryByText('Edit Content Plan')).not.toBeInTheDocument();
  });

  // ── Form labels ────────────────────────────────────────────────────────────

  it('renders the Title label', () => {
    renderDialog();
    expect(screen.getByText('Title')).toBeInTheDocument();
  });

  it('renders the Description label', () => {
    renderDialog();
    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it('renders the Status label', () => {
    renderDialog();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  // ── Pre-populated values ───────────────────────────────────────────────────

  it('pre-populates the title input with the contentPlan value', () => {
    renderDialog({ contentPlan: makePlan({ title: 'Spring Campaign' }) });
    const input = screen.getByPlaceholderText('Content plan title') as HTMLInputElement;
    expect(input.value).toBe('Spring Campaign');
  });

  it('pre-populates the description textarea with the contentPlan value', () => {
    renderDialog({ contentPlan: makePlan({ description: 'My description' }) });
    const textarea = screen.getByPlaceholderText('Content plan description') as HTMLTextAreaElement;
    expect(textarea.value).toBe('My description');
  });

  it('pre-selects the status dropdown with the contentPlan status', () => {
    renderDialog({ contentPlan: makePlan({ status: ContentPlanStatus.Active }) });
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe(ContentPlanStatus.Active);
  });

  // ── Status dropdown options ────────────────────────────────────────────────

  it('renders all ContentPlanStatus values as options', () => {
    renderDialog();
    const statuses = Object.values(ContentPlanStatus);
    statuses.forEach((status) => {
      expect(screen.getByRole('option', { name: status })).toBeInTheDocument();
    });
  });

  // ── User interactions ──────────────────────────────────────────────────────

  it('updates the title input as the user types', () => {
    renderDialog({ contentPlan: makePlan({ title: '' }) });

    const input = screen.getByPlaceholderText('Content plan title');
    userEvent.clear(input);
    userEvent.type(input, 'New Title');

    expect((input as HTMLInputElement).value).toBe('New Title');
  });

  it('updates the description textarea as the user types', () => {
    renderDialog({ contentPlan: makePlan({ description: '' }) });

    const textarea = screen.getByPlaceholderText('Content plan description');
    userEvent.clear(textarea);
    userEvent.type(textarea, 'New description text');

    expect((textarea as HTMLTextAreaElement).value).toBe('New description text');
  });

  it('updates the status select when user picks a different option', () => {
    renderDialog({ contentPlan: makePlan({ status: ContentPlanStatus.Draft }) });

    userEvent.selectOptions(screen.getByRole('combobox'), ContentPlanStatus.Completed);

    expect((screen.getByRole('combobox') as HTMLSelectElement).value).toBe(ContentPlanStatus.Completed);
  });

  // ── Validation ─────────────────────────────────────────────────────────────

  it('shows a validation error when the title is cleared and form is submitted', async () => {
    renderDialog({ contentPlan: makePlan({ title: 'Some Title' }) });

    const input = screen.getByPlaceholderText('Content plan title');
    userEvent.clear(input);
    userEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getAllByText(/this field is required/i).length).toBeGreaterThan(0);
    });
  });

  // ── Submit ─────────────────────────────────────────────────────────────────

  it('calls updateContentPlan with the correct id on submit', async () => {
    renderDialog({ contentPlan: makePlan({ id: 'plan-42' }) });

    userEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockUpdateContentPlan).toHaveBeenCalled();
      expect(mockUpdateContentPlan.mock.calls[0][0].id).toBe('plan-42');
    });
  });

  // ── Close actions ──────────────────────────────────────────────────────────

  it('calls onClose when the Cancel button is clicked', () => {
    const onClose = jest.fn();
    renderDialog({ onClose });

    userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContentPlan from './ContentPlan';
import { ContentPlanStatus } from '../../../../../enum/ContentPlanStatus';
import { TContentPlan } from '../../../../../models/ContentPlan';

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('react-toastify', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ businessId: 'biz-1' }),
}));

const mockGetContentPlans = jest.fn();
const mockDeleteContentPlan = jest.fn();

jest.mock('../../../../../store/contentPlan/contentPlanApi', () => ({
  useLazyGetContentPlansQuery: () => [mockGetContentPlans, { isLoading: false }],
  useDeleteContentPlanMutation: () => [mockDeleteContentPlan, { isLoading: false }],
}));

const mockDispatch = jest.fn();

jest.mock('../../../../../store/hooks', () => ({
  useAppDispatch: () => mockDispatch,
}));

let mockContentPlans: TContentPlan[] | null = null;

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: (selector: (state: unknown) => unknown) =>
    selector({ contentPlanModule: { contentPlans: mockContentPlans } }),
}));

jest.mock('../../../../../store/contentPlan/contentPlanSlice', () => ({
  setContentPlans: (data: unknown) => ({ type: 'contentPlan/setContentPlans', payload: data }),
}));

jest.mock('./components/GenerateContentPlanDlg', () => ({
  __esModule: true,
  default: ({ open, onClose }: { open: boolean; onClose: () => void }) =>
    open ? <div role="dialog" aria-label="Generate Content Plan"><button onClick={onClose}>Close Generate</button></div> : null,
}));

jest.mock('./components/UpdateContentPlanDlg', () => ({
  __esModule: true,
  default: ({ open, onClose }: { open: boolean; onClose: () => void }) =>
    open ? <div role="dialog" aria-label="Update Content Plan"><button onClick={onClose}>Close Update</button></div> : null,
}));

jest.mock('../../../../../components/confirmDlg/ConfirmDlg', () => ({
  confirm: jest.fn(),
}));

jest.mock('../../../../../components/textDlg/TextDlg', () => ({
  __esModule: true,
  default: ({ open }: { open: boolean }) =>
    open ? <div role="dialog" aria-label="Text Dialog" /> : null,
}));

jest.mock('../../../../../utils/showError', () => ({
  showError: jest.fn(),
}));

jest.mock('../../../../../utils/getStatusClass', () => ({
  getStatusClass: () => '',
}));

jest.mock('../../../../../utils/toDate', () => ({
  toDate: (d: Date) => new Date(d).toISOString().slice(0, 10),
}));

jest.mock('../../../../../hooks/useCopyToClipboard', () => ({
  useCopyToClipboard: () => ({ copy: jest.fn() }),
}));

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makePlan(overrides: Partial<TContentPlan> = {}): TContentPlan {
  return {
    id: 'plan-1',
    businessId: 'biz-1',
    title: 'Q1 Plan',
    description: 'A sample description',
    status: ContentPlanStatus.Draft,
    mode: 'manual',
    createdAt: new Date('2024-01-15'),
    ...overrides,
  };
}

function renderComponent() {
  return render(<ContentPlan />);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('ContentPlan page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockContentPlans = null;
    mockGetContentPlans.mockReturnValue({
      unwrap: () => Promise.resolve({ data: [] }),
    });
    mockDeleteContentPlan.mockReturnValue({
      unwrap: () => Promise.resolve({ data: {}, message: 'Deleted' }),
    });
  });

  // ── Heading and controls ───────────────────────────────────────────────────

  it('renders the "Content Plan" heading', () => {
    renderComponent();
    expect(screen.getByRole('heading', { name: /content plan/i })).toBeInTheDocument();
  });

  it('renders the Generate button', () => {
    renderComponent();
    expect(screen.getByRole('button', { name: /generate/i })).toBeInTheDocument();
  });

  it('renders column headers: Title, Description, Status, Mode, Created At, Actions', () => {
    renderComponent();
    expect(screen.getByRole('columnheader', { name: /title/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /description/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /status/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /mode/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /created at/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /actions/i })).toBeInTheDocument();
  });

  // ── Empty state ────────────────────────────────────────────────────────────

  it('shows "No data" when contentPlans is null', () => {
    mockContentPlans = null;
    renderComponent();
    expect(screen.getByText(/no data/i)).toBeInTheDocument();
  });

  it('shows "No data" when contentPlans is an empty array', () => {
    mockContentPlans = [];
    renderComponent();
    expect(screen.getByText(/no data/i)).toBeInTheDocument();
  });

  // ── Row data ───────────────────────────────────────────────────────────────

  it('renders plan title in the table', () => {
    mockContentPlans = [makePlan({ title: 'Spring Campaign' })];
    renderComponent();
    expect(screen.getByText('Spring Campaign')).toBeInTheDocument();
  });

  it('renders plan status badge', () => {
    mockContentPlans = [makePlan({ status: ContentPlanStatus.Active })];
    renderComponent();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders plan mode capitalised', () => {
    mockContentPlans = [makePlan({ mode: 'manual' })];
    renderComponent();
    expect(screen.getByText('manual')).toBeInTheDocument();
  });

  it('renders a row for each plan', () => {
    mockContentPlans = [
      makePlan({ id: 'p-1', title: 'Plan A' }),
      makePlan({ id: 'p-2', title: 'Plan B' }),
    ];
    renderComponent();
    expect(screen.getByText('Plan A')).toBeInTheDocument();
    expect(screen.getByText('Plan B')).toBeInTheDocument();
  });

  // ── Pagination ─────────────────────────────────────────────────────────────

  it('renders Prev and Next pagination buttons', () => {
    renderComponent();
    expect(screen.getByRole('button', { name: /prev/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
  });

  it('disables Prev button on the first page', () => {
    renderComponent();
    expect(screen.getByRole('button', { name: /prev/i })).toBeDisabled();
  });

  // ── Generate dialog ────────────────────────────────────────────────────────

  it('opens the Generate dialog when the Generate button is clicked', () => {
    renderComponent();

    expect(screen.queryByRole('dialog', { name: /generate content plan/i })).not.toBeInTheDocument();

    userEvent.click(screen.getByRole('button', { name: /generate/i }));

    expect(screen.getByRole('dialog', { name: /generate content plan/i })).toBeInTheDocument();
  });

  it('closes the Generate dialog when its close callback fires', () => {
    renderComponent();

    userEvent.click(screen.getByRole('button', { name: /generate/i }));
    expect(screen.getByRole('dialog', { name: /generate content plan/i })).toBeInTheDocument();

    userEvent.click(screen.getByRole('button', { name: /close generate/i }));
    expect(screen.queryByRole('dialog', { name: /generate content plan/i })).not.toBeInTheDocument();
  });

  // ── Edit dialog ────────────────────────────────────────────────────────────

  it('opens the Update dialog when the edit button is clicked', () => {
    mockContentPlans = [makePlan()];
    renderComponent();

    expect(screen.queryByRole('dialog', { name: /update content plan/i })).not.toBeInTheDocument();

    userEvent.click(screen.getByRole('button', { name: /✎/i }));

    expect(screen.getByRole('dialog', { name: /update content plan/i })).toBeInTheDocument();
  });

  it('closes the Update dialog when its close callback fires', () => {
    mockContentPlans = [makePlan()];
    renderComponent();

    userEvent.click(screen.getByRole('button', { name: /✎/i }));
    expect(screen.getByRole('dialog', { name: /update content plan/i })).toBeInTheDocument();

    userEvent.click(screen.getByRole('button', { name: /close update/i }));
    expect(screen.queryByRole('dialog', { name: /update content plan/i })).not.toBeInTheDocument();
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GenerateContentPlanDlg } from './GenerateContentPlanDlg';

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('react-toastify', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ businessId: 'biz-1' }),
}));

const mockGenerateContentPlan = jest.fn();
const mockGetContentPlans = jest.fn();
const mockGetProducts = jest.fn();
const mockGetAudiences = jest.fn();
const mockGetIdeas = jest.fn();
const mockGetIdeasAI = jest.fn();

jest.mock('../../../../../../store/contentPlan/contentPlanApi', () => ({
  useGenerateContentPlanMutation: () => [mockGenerateContentPlan, { isLoading: false }],
  useLazyGetContentPlansQuery: () => [mockGetContentPlans, { isLoading: false }],
}));

jest.mock('../../../../../../store/products/productsApi', () => ({
  useGetProductsMutation: () => [mockGetProducts, { isLoading: false }],
}));

jest.mock('../../../../../../store/audience/audienceApi', () => ({
  useGetAudiencesMutation: () => [mockGetAudiences, { isLoading: false }],
}));

jest.mock('../../../../../../store/idea/ideaApi', () => ({
  useGetIdeasMutation: () => [mockGetIdeas, { isLoading: false }],
}));

jest.mock('../../../../../../store/ai/ideas/ideaAiApi', () => ({
  useLazyGetIdeasAIQuery: () => [mockGetIdeasAI, { isLoading: false }],
}));

jest.mock('../../../../../../store/calendarific/calendarificApi', () => ({
  useGetCalendarificHolidaysQuery: () => ({ data: undefined }),
}));

const mockGetBusiness = jest.fn();

jest.mock('../../../../../../store/businesses/businessesApi', () => ({
  useGetBusinessMutation: () => [mockGetBusiness, { isLoading: false }],
}));

jest.mock('../../../../../../store/businesses/businessesSlice', () => ({
  setBusiness: (d: unknown) => ({ type: 'business/setBusiness', payload: d }),
}));

const mockDispatch = jest.fn();

jest.mock('../../../../../../store/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({
      productsModule: { products: [] },
      audienceModule: { audiences: [] },
      ideaModule: { ideas: [] },
      ideaAiModule: { ideasAi: [] },
      businessModule: { business: null },
    }),
}));

jest.mock('../../../../../../store/contentPlan/contentPlanSlice', () => ({
  setContentPlans: (d: unknown) => ({ type: 'contentPlan/setContentPlans', payload: d }),
}));

jest.mock('../../../../../../store/products/productsSlice', () => ({
  setProducts: (d: unknown) => ({ type: 'products/setProducts', payload: d }),
}));

jest.mock('../../../../../../store/audience/audienceSlice', () => ({
  setAudiences: (d: unknown) => ({ type: 'audience/setAudiences', payload: d }),
}));

jest.mock('../../../../../../store/idea/ideaSlice', () => ({
  setIdeas: (d: unknown) => ({ type: 'idea/setIdeas', payload: d }),
}));

jest.mock('../../../../../../store/ai/ideas/ideaAiSlice', () => ({
  setIdeasAi: (d: unknown) => ({ type: 'ideaAi/setIdeasAi', payload: d }),
}));

jest.mock('../../../../../../utils/showError', () => ({
  showError: jest.fn(),
}));

const mockHandleChange = jest.fn();
let mockForm = {
  productsIds: [] as string[],
  audiencesIds: [] as string[],
  ideasIds: [] as string[],
};

jest.mock('../../../../../../hooks/useForm', () => ({
  useForm: () => ({
    form: mockForm,
    handleChange: mockHandleChange,
    setForm: jest.fn(),
    resetForm: jest.fn(),
  }),
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

function renderDialog(props: { open?: boolean; onClose?: () => void } = {}) {
  const defaults = { open: true, onClose: jest.fn() };
  return render(<GenerateContentPlanDlg {...defaults} {...props} />);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('GenerateContentPlanDlg', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetProducts.mockReturnValue({ unwrap: () => Promise.resolve({ data: [] }) });
    mockGetAudiences.mockReturnValue({ unwrap: () => Promise.resolve({ data: [] }) });
    mockGetIdeas.mockReturnValue({ unwrap: () => Promise.resolve({ data: [] }) });
    mockGetIdeasAI.mockReturnValue({ unwrap: () => Promise.resolve({ data: [] }) });
    mockGetContentPlans.mockReturnValue({ unwrap: () => Promise.resolve({ data: [] }) });
    mockGetBusiness.mockReturnValue({ unwrap: () => Promise.resolve({ data: null }) });
    mockGenerateContentPlan.mockReturnValue({
      unwrap: () => Promise.resolve({ data: [], message: 'Generated' }),
    });
  });

  // ── Visibility ─────────────────────────────────────────────────────────────

  it('renders when open is true', () => {
    renderDialog();
    expect(screen.getByText('Generate Content Plan')).toBeInTheDocument();
  });

  it('does not render when open is false', () => {
    renderDialog({ open: false });
    expect(screen.queryByText('Generate Content Plan')).not.toBeInTheDocument();
  });

  // ── Actions ────────────────────────────────────────────────────────────────

  it('renders the Generate submit button', () => {
    renderDialog();
    expect(screen.getByRole('button', { name: /^generate$/i })).toBeInTheDocument();
  });

  it('renders the Cancel button', () => {
    renderDialog();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('calls onClose when Cancel is clicked', () => {
    const onClose = jest.fn();
    renderDialog({ onClose });

    userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

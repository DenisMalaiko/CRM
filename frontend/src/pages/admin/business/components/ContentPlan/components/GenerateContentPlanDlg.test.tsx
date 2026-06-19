import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GenerateContentPlanDlg from './GenerateContentPlanDlg';

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

const mockDispatch = jest.fn();

jest.mock('../../../../../../store/hooks', () => ({
  useAppDispatch: () => mockDispatch,
}));

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: (selector: (state: unknown) => unknown) =>
    selector({
      productsModule: { products: [] },
      audienceModule: { audiences: [] },
      ideaModule: { ideas: [] },
      ideaAiModule: { ideasAi: [] },
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
  context: '',
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

  // ── Mode radio options ─────────────────────────────────────────────────────

  it('renders the "Create manually" radio option', () => {
    renderDialog();
    expect(screen.getByText('Create manually')).toBeInTheDocument();
  });

  it('renders the "From business profile" radio option', () => {
    renderDialog();
    expect(screen.getByText('From business profile')).toBeInTheDocument();
  });

  it('defaults to the "manual" mode radio being checked', () => {
    renderDialog();
    const radios = screen.getAllByRole('radio');
    const manualRadio = radios.find(r => (r as HTMLInputElement).value === 'manual');
    expect(manualRadio).toBeChecked();
  });

  it('does not check the "profile" radio by default', () => {
    renderDialog();
    const radios = screen.getAllByRole('radio');
    const profileRadio = radios.find(r => (r as HTMLInputElement).value === 'profile');
    expect(profileRadio).not.toBeChecked();
  });

  // ── Mode switching ─────────────────────────────────────────────────────────

  it('shows the context textarea when "From business profile" is selected', () => {
    renderDialog();

    expect(screen.queryByPlaceholderText(/describe your business profile context/i)).not.toBeInTheDocument();

    const radios = screen.getAllByRole('radio');
    const profileRadio = radios.find(r => (r as HTMLInputElement).value === 'profile')!;
    userEvent.click(profileRadio);

    expect(screen.getByPlaceholderText(/describe your business profile context/i)).toBeInTheDocument();
  });

  it('hides the context textarea when switching back to "manual" mode', () => {
    renderDialog();

    const radios = screen.getAllByRole('radio');
    const profileRadio = radios.find(r => (r as HTMLInputElement).value === 'profile')!;
    const manualRadio = radios.find(r => (r as HTMLInputElement).value === 'manual')!;

    userEvent.click(profileRadio);
    expect(screen.getByPlaceholderText(/describe your business profile context/i)).toBeInTheDocument();

    userEvent.click(manualRadio);
    expect(screen.queryByPlaceholderText(/describe your business profile context/i)).not.toBeInTheDocument();
  });

  it('checks the "profile" radio after clicking it', () => {
    renderDialog();

    const radios = screen.getAllByRole('radio');
    const profileRadio = radios.find(r => (r as HTMLInputElement).value === 'profile')!;
    userEvent.click(profileRadio);

    expect(profileRadio).toBeChecked();
  });

  it('unchecks "manual" radio after switching to "profile"', () => {
    renderDialog();

    const radios = screen.getAllByRole('radio');
    const profileRadio = radios.find(r => (r as HTMLInputElement).value === 'profile')!;
    const manualRadio = radios.find(r => (r as HTMLInputElement).value === 'manual')!;

    userEvent.click(profileRadio);
    expect(manualRadio).not.toBeChecked();
  });

  // ── Context textarea ───────────────────────────────────────────────────────

  it('calls handleChange when text is entered into the context textarea', () => {
    renderDialog();

    const radios = screen.getAllByRole('radio');
    const profileRadio = radios.find(r => (r as HTMLInputElement).value === 'profile')!;
    userEvent.click(profileRadio);

    const textarea = screen.getByPlaceholderText(/describe your business profile context/i);
    userEvent.type(textarea, 'My context');
    expect(mockHandleChange).toHaveBeenCalled();
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

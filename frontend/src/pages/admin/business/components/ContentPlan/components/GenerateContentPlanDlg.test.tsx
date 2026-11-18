import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GenerateContentPlanDlg } from './GenerateContentPlanDlg';
import { IdeaStatus } from '../../../../../../enum/IdeaStatus';

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'ContentPlan.generateTitle': 'Generate Content Plan',
        'ContentPlan.generate': 'Generate',
        'ContentPlan.generating': 'Generating...',
        'ContentPlan.products': 'Products',
        'ContentPlan.audiences': 'Audiences',
        'ContentPlan.idea': 'Idea',
        'ContentPlan.marketingCalendar': 'Marketing Calendar',
        'ContentPlan.ideas': 'Ideas',
        'ContentPlan.badgeAI': 'AI',
        'ContentPlan.badgeCompetitor': 'Competitor',
        'ContentPlan.badgeNew': 'New',
        'ContentPlan.selectHoliday': 'Select a holiday',
        'ContentPlan.selectHolidayPlaceholder': 'Select a holiday...',
        'ContentPlan.selectHolidayError': 'Please select a holiday from the calendar',
        'General.cancel': 'Cancel',
      };
      return map[key] ?? key;
    },
    i18n: { language: 'en' },
  }),
}));

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
const mockAppSelector = jest.fn();

jest.mock('../../../../../../store/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (state: unknown) => unknown) => mockAppSelector(selector),
}));

function buildStoreState(overrides: {
  products?: unknown[];
  audiences?: unknown[];
  ideas?: unknown[];
  ideasAi?: unknown[];
  business?: unknown;
} = {}) {
  return {
    productsModule: { products: overrides.products ?? [] },
    audienceModule: { audiences: overrides.audiences ?? [] },
    ideaModule: { ideas: overrides.ideas ?? [] },
    ideaAiModule: { ideasAi: overrides.ideasAi ?? [] },
    businessModule: { business: overrides.business ?? null },
  };
}

function setupSelector(overrides: Parameters<typeof buildStoreState>[0] = {}) {
  const state = buildStoreState(overrides);
  mockAppSelector.mockImplementation((selector: (s: unknown) => unknown) => selector(state));
}

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

jest.mock('../../Assets/Gallery/components/selectGalleryDlg/SelectGalleryDlg', () => ({
  SelectGalleryDlg: ({ onSelect }: { onSelect: (photos: unknown[]) => void; selectedIds: string[]; focus: null }) => (
    <div data-testid="select-gallery-dlg">
      <button onClick={() => onSelect([])}>Select Photos</button>
    </div>
  ),
}));

const mockHandleChange = jest.fn();
let mockForm = {
  productsIds: [] as string[],
  audiencesIds: [] as string[],
  ideasIds: [] as string[],
  photosIds: [] as string[],
  defaultPhotosIds: [] as string[],
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
    setupSelector();
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

  // ── SelectGalleryDlg integration ───────────────────────────────────────────

  it('renders the SelectGalleryDlg photo picker', () => {
    renderDialog();
    expect(screen.getByTestId('select-gallery-dlg')).toBeInTheDocument();
  });

  // ── Helper for ideas select tests ─────────────────────────────────────────
  // react-select renders options only after the menu is opened.
  // getByRole('combobox') finds the hidden input inside react-select.
  // The control is the grandparent of that input (input → value-container → control).

  function openIdeasMenu() {
    const comboboxes = screen.getAllByRole('combobox');
    // The ideas select is the last combobox (products/audiences selects come first if present)
    const combobox = comboboxes[comboboxes.length - 1];
    // Navigate up: input → div (value-container) → div (control)
    const control = combobox.parentElement?.parentElement as HTMLElement;
    fireEvent.mouseDown(control);
  }

  // ── allIdeasOptions — IdeaStatus.New inclusion ─────────────────────────────

  describe('ideas select — IdeaStatus.New inclusion', () => {
    it('shows a manual idea with status New in the select options', () => {
      setupSelector({ ideas: [
        { id: 'idea-new', title: 'Fresh Idea', status: IdeaStatus.New, createdAt: new Date('2024-06-01T10:00:00Z') },
      ] });

      renderDialog();
      openIdeasMenu();

      expect(screen.getByText('Fresh Idea')).toBeInTheDocument();
    });

    it('shows an AI idea with status New in the select options', () => {
      setupSelector({ ideasAi: [
        { id: 'ai-new', title: 'AI Fresh Idea', status: IdeaStatus.New, createdAt: new Date('2024-06-01T10:00:00Z') },
      ] });

      renderDialog();
      openIdeasMenu();

      expect(screen.getByText('AI Fresh Idea')).toBeInTheDocument();
    });

    it('shows ideas with status Planned and Used alongside New', () => {
      setupSelector({ ideas: [
        { id: 'idea-planned', title: 'Planned Idea', status: IdeaStatus.Planned, createdAt: new Date('2024-05-01T00:00:00Z') },
        { id: 'idea-used', title: 'Used Idea', status: IdeaStatus.Used, createdAt: new Date('2024-04-01T00:00:00Z') },
        { id: 'idea-new', title: 'New Idea', status: IdeaStatus.New, createdAt: new Date('2024-06-01T00:00:00Z') },
      ] });

      renderDialog();
      openIdeasMenu();

      expect(screen.getByText('Planned Idea')).toBeInTheDocument();
      expect(screen.getByText('Used Idea')).toBeInTheDocument();
      expect(screen.getByText('New Idea')).toBeInTheDocument();
    });

    it('does not show ideas with status Archived', () => {
      setupSelector({ ideas: [
        { id: 'idea-archived', title: 'Archived Idea', status: IdeaStatus.Archived, createdAt: new Date('2024-01-01T00:00:00Z') },
        { id: 'idea-new', title: 'Visible Idea', status: IdeaStatus.New, createdAt: new Date('2024-06-01T00:00:00Z') },
      ] });

      renderDialog();
      openIdeasMenu();

      expect(screen.getByText('Visible Idea')).toBeInTheDocument();
      expect(screen.queryByText('Archived Idea')).not.toBeInTheDocument();
    });
  });

  // ── allIdeasOptions — sort by createdAt descending ─────────────────────────

  describe('ideas select — sort by createdAt descending', () => {
    it('renders newer ideas before older ideas', () => {
      setupSelector({ ideas: [
        { id: 'idea-old', title: 'Older Idea', status: IdeaStatus.Planned, createdAt: new Date('2024-01-01T00:00:00Z') },
        { id: 'idea-new', title: 'Newer Idea', status: IdeaStatus.Planned, createdAt: new Date('2024-12-01T00:00:00Z') },
      ] });

      renderDialog();
      openIdeasMenu();

      const options = screen.getAllByText(/Older Idea|Newer Idea/);
      const newerIndex = options.findIndex(el => el.textContent === 'Newer Idea');
      const olderIndex = options.findIndex(el => el.textContent === 'Older Idea');
      expect(newerIndex).toBeLessThan(olderIndex);
    });

    it('interleaves manual and AI ideas in newest-first order', () => {
      setupSelector({
        ideas: [
          { id: 'manual-mid', title: 'Manual Mid', status: IdeaStatus.Planned, createdAt: new Date('2024-06-01T00:00:00Z') },
        ],
        ideasAi: [
          { id: 'ai-newest', title: 'AI Newest', status: IdeaStatus.New, createdAt: new Date('2024-12-01T00:00:00Z') },
          { id: 'ai-oldest', title: 'AI Oldest', status: IdeaStatus.Used, createdAt: new Date('2024-01-01T00:00:00Z') },
        ],
      });

      renderDialog();
      openIdeasMenu();

      const allOptionTexts = screen
        .getAllByText(/AI Newest|Manual Mid|AI Oldest/)
        .map(el => el.textContent ?? '');

      expect(allOptionTexts.indexOf('AI Newest')).toBeLessThan(allOptionTexts.indexOf('Manual Mid'));
      expect(allOptionTexts.indexOf('Manual Mid')).toBeLessThan(allOptionTexts.indexOf('AI Oldest'));
    });
  });

  // ── formatOptionLabel — green "New" badge ──────────────────────────────────
  // isNew is computed as: now - createdAt < 24 hours.
  // Options with a recent createdAt get the green badge; older ones do not.

  describe('formatOptionLabel — green New badge', () => {
    it('shows the green New badge for a manual idea created within the last 24 hours', () => {
      setupSelector({ ideas: [
        { id: 'idea-recent', title: 'Has Badge', status: IdeaStatus.New, createdAt: new Date() },
      ] });

      const { container } = renderDialog();
      openIdeasMenu();

      expect(screen.getByText('Has Badge')).toBeInTheDocument();
      expect(container.querySelector('.bg-green-100')).toBeInTheDocument();
    });

    it('does not show the green New badge for a manual idea created more than 24 hours ago', () => {
      setupSelector({ ideas: [
        { id: 'idea-old', title: 'No Badge', status: IdeaStatus.Planned, createdAt: new Date('2024-06-01T00:00:00Z') },
      ] });

      const { container } = renderDialog();
      openIdeasMenu();

      expect(screen.getByText('No Badge')).toBeInTheDocument();
      expect(container.querySelector('.bg-green-100')).not.toBeInTheDocument();
    });

    it('shows the green New badge alongside the AI badge for a recently-created AI idea', () => {
      setupSelector({ ideasAi: [
        { id: 'ai-recent', title: 'AI With Badge', status: IdeaStatus.New, createdAt: new Date() },
      ] });

      const { container } = renderDialog();
      openIdeasMenu();

      expect(screen.getByText('AI With Badge')).toBeInTheDocument();
      expect(container.querySelector('.bg-green-100')).toBeInTheDocument();
      expect(screen.getByText('AI')).toBeInTheDocument();
    });

    it('does not show the New badge for an AI idea created more than 24 hours ago', () => {
      setupSelector({ ideasAi: [
        { id: 'ai-old', title: 'AI No Badge', status: IdeaStatus.Used, createdAt: new Date('2024-06-01T00:00:00Z') },
      ] });

      const { container } = renderDialog();
      openIdeasMenu();

      expect(screen.getByText('AI No Badge')).toBeInTheDocument();
      expect(container.querySelector('.bg-green-100')).not.toBeInTheDocument();
      expect(screen.getByText('AI')).toBeInTheDocument();
    });
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import CreateCreativeDlg from './CreateCreativeDlg';
import { MediaType } from '../../enum/MediaType';
import { BusinessProfileFocus } from '../../enum/BusinessProfileFocus';

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('react-toastify', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock('../../utils/showError', () => ({ showError: jest.fn() }));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ businessId: 'biz-1' }),
}));

// Stub all RTK Query hooks used by the component
jest.mock('../../store/profile/profileApi', () => ({
  useGetProfilesMutation: () => [jest.fn().mockReturnValue({ unwrap: () => Promise.resolve({ data: [] }) })],
  useGeneratePostsMutation: () => [jest.fn()],
}));

jest.mock('../../store/products/productsApi', () => ({
  useGetProductsMutation: () => [jest.fn().mockReturnValue({ unwrap: () => Promise.resolve({ data: [] }) })],
}));

jest.mock('../../store/audience/audienceApi', () => ({
  useGetAudiencesMutation: () => [jest.fn().mockReturnValue({ unwrap: () => Promise.resolve({ data: [] }) })],
}));

jest.mock('../../store/prompts/promptApi', () => ({
  useGetPromptsMutation: () => [jest.fn().mockReturnValue({ unwrap: () => Promise.resolve({ data: [] }) })],
}));

jest.mock('../../store/idea/ideaApi', () => ({
  useGetIdeasMutation: () => [jest.fn().mockReturnValue({ unwrap: () => Promise.resolve({ data: [] }) })],
}));

jest.mock('../../store/gallery/galleryApi', () => ({
  useGetPhotosMutation: () => [jest.fn().mockReturnValue({ unwrap: () => Promise.resolve({ data: [] }) })],
  useLazyGetDefaultPhotosQuery: () => [jest.fn().mockReturnValue({ unwrap: () => Promise.resolve({ data: [] }) })],
}));

jest.mock('../../store/artifact/artifactApi', () => ({
  useLazyGetAiArtifactsQuery: () => [jest.fn()],
  useCreateCreativeManuallyMutation: () => [jest.fn()],
}));

jest.mock('../../store/ai/ideas/ideaAiApi', () => ({
  useLazyGetIdeasAIQuery: () => [jest.fn().mockReturnValue({ unwrap: () => Promise.resolve({ data: [] }) })],
}));

// Stub the SelectGalleryDlg to avoid its own deep dependency tree
jest.mock('../../pages/admin/business/components/Assets/Gallery/components/selectGalleryDlg/SelectGalleryDlg', () => ({
  SelectGalleryDlg: () => <div data-testid="select-gallery-dlg" />,
}));

// ── Store helper ──────────────────────────────────────────────────────────────

const emptyGalleryState = { photos: [], defaultPhotos: [], aiPhotos: [] };
const emptyProfileState = { profiles: [] };
const emptyProductsState = { products: [] };
const emptyAudienceState = { audiences: [] };
const emptyPromptState = { prompts: [] };
const emptyIdeaState = { ideas: [] };
const emptyIdeaAiState = { ideasAi: [] };

function makeStore() {
  return configureStore({
    reducer: {
      galleryModule: () => emptyGalleryState,
      profileModule: () => emptyProfileState,
      productsModule: () => emptyProductsState,
      audienceModule: () => emptyAudienceState,
      promptModule: () => emptyPromptState,
      ideaModule: () => emptyIdeaState,
      ideaAiModule: () => emptyIdeaAiState,
    },
  });
}

function renderDialog(
  props: Partial<{ open: boolean; onClose: () => void; focus: string }> = {}
) {
  const defaults = {
    open: true,
    onClose: jest.fn(),
    focus: BusinessProfileFocus.GeneratePosts,
  };
  const store = makeStore();
  return {
    store,
    onClose: props.onClose ?? defaults.onClose,
    ...render(
      <Provider store={store}>
        <MemoryRouter>
          <CreateCreativeDlg {...defaults} {...props} />
        </MemoryRouter>
      </Provider>
    ),
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('CreateCreativeDlg — mediaType radio group', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the Photo option in the media type radio group', () => {
    renderDialog();
    expect(screen.getByText(MediaType.Image)).toBeInTheDocument();
  });

  it('renders the Video option in the media type radio group', () => {
    renderDialog();
    expect(screen.getByText(MediaType.Video)).toBeInTheDocument();
  });

  it('selects Photo by default', () => {
    renderDialog();
    const photoRadio = screen.getByRole('radio', { name: MediaType.Image });
    expect(photoRadio).toBeChecked();
  });

  it('does not select Video by default', () => {
    renderDialog();
    const videoRadio = screen.getByRole('radio', { name: MediaType.Video });
    expect(videoRadio).not.toBeChecked();
  });

  it('selects Video when the Video option is clicked', () => {
    renderDialog();

    const videoRadio = screen.getByRole('radio', { name: MediaType.Video });
    userEvent.click(videoRadio);

    expect(videoRadio).toBeChecked();
  });

  it('deselects Photo when Video is clicked', () => {
    renderDialog();

    userEvent.click(screen.getByRole('radio', { name: MediaType.Video }));

    expect(screen.getByRole('radio', { name: MediaType.Image })).not.toBeChecked();
  });

  it('returns to Photo when Photo is clicked after Video was selected', () => {
    renderDialog();

    userEvent.click(screen.getByRole('radio', { name: MediaType.Video }));
    userEvent.click(screen.getByRole('radio', { name: MediaType.Image }));

    expect(screen.getByRole('radio', { name: MediaType.Image })).toBeChecked();
    expect(screen.getByRole('radio', { name: MediaType.Video })).not.toBeChecked();
  });
});

describe('CreateCreativeDlg — general rendering', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the dialog when open is true', () => {
    renderDialog({ open: true });
    expect(screen.getByText(/create post/i)).toBeInTheDocument();
  });

  it('does not render the dialog when open is false', () => {
    renderDialog({ open: false });
    expect(screen.queryByText(/create post/i)).not.toBeInTheDocument();
  });

  it('renders the "Create manually" option', () => {
    renderDialog();
    expect(screen.getByText('Create manually')).toBeInTheDocument();
  });

  it('renders the "Generate from context" option', () => {
    renderDialog();
    expect(screen.getByText('Generate from context')).toBeInTheDocument();
  });

  it('calls onClose when Cancel button is clicked', () => {
    const onClose = jest.fn();
    renderDialog({ onClose });

    userEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('mediaType radio group is visible only when "Create manually" mode is active', () => {
    renderDialog();
    // "Create manually" is selected by default — radio group should be visible
    expect(screen.getByRole('radio', { name: MediaType.Image })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: MediaType.Video })).toBeInTheDocument();
  });

  it('hides mediaType radio group when "Generate from context" mode is selected', () => {
    renderDialog();

    // Click the visible label text to switch to context mode
    userEvent.click(screen.getByText('Generate from context'));

    expect(screen.queryByRole('radio', { name: MediaType.Image })).not.toBeInTheDocument();
    expect(screen.queryByRole('radio', { name: MediaType.Video })).not.toBeInTheDocument();
  });
});

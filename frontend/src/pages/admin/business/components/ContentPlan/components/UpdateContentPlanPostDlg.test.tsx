import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UpdateContentPlanPostDlg } from './UpdateContentPlanPostDlg';
import { TContentPlanPost } from '../../../../../../models/ContentPlan';

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'ContentPlanPosts.EditPost': 'Edit Post',
        'ContentPlanPosts.FunnelStage': 'Funnel Stage',
        'ContentPlanPosts.Format': 'Format',
        'ContentPlanPosts.ContentType': 'Content Type',
        'ContentPlanPosts.Title': 'Title',
        'ContentPlanPosts.Topic': 'Topic',
        'ContentPlanPosts.Hook': 'Hook',
        'ContentPlanPosts.Thesis': 'Thesis',
        'ContentPlanPosts.CTA': 'CTA',
        'ContentPlanPosts.MarketingGoal': 'Marketing Goal',
        'ContentPlanPosts.DesignReference': 'Design Reference',
        'ContentPlanPosts.Photo': 'Photo',
        'ContentPlanPosts.SelectPhoto': 'Select Photo',
        'ContentPlanPosts.ChangePhoto': 'Change Photo',
        'General.cancel': 'Cancel',
        'General.save': 'Save',
        'General.saving': 'Saving...',
      };
      return map[key] ?? key;
    },
  }),
}));

jest.mock('react-toastify', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const mockUpdatePost = jest.fn();
const mockGetContentPlanPosts = jest.fn();

jest.mock('../../../../../../store/contentPlan/contentPlanApi', () => ({
  useUpdateContentPlanPostMutation: () => [mockUpdatePost, { isLoading: false }],
  useLazyGetContentPlanPostsQuery: () => [mockGetContentPlanPosts, { isLoading: false }],
}));

jest.mock('../../../../../../utils/showError', () => ({
  showError: jest.fn(),
}));

jest.mock('../../Assets/Gallery/components/selectGalleryDlg/SelectGalleryDlg', () => ({
  SelectGalleryDlg: ({ onSelect }: { onSelect: (photos: { id: string; url: string }[]) => void }) => (
    <button
      data-testid="mock-gallery"
      onClick={() => onSelect([{ id: 'gallery-photo-1', url: 'https://example.com/gallery.jpg' }])}
    >
      Gallery
    </button>
  ),
}));

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makePost(overrides: Partial<TContentPlanPost> = {}): TContentPlanPost {
  return {
    day: 1,
    date: '2024-01-15',
    funnelStage: 'TOFU',
    format: 'POST',
    contentType: 'Educational',
    topic: 'Sample topic',
    marketingGoal: 'Increase awareness',
    title: 'Sample title',
    hook: 'Sample hook',
    thesis: 'Sample thesis',
    cta: 'Learn more',
    designReference: 'Minimalist',
    ...overrides,
  };
}

function renderDialog(props: {
  open?: boolean;
  onClose?: () => void;
  post?: TContentPlanPost;
  contentPlanId?: string;
} = {}) {
  const defaults = {
    open: true,
    onClose: jest.fn(),
    post: makePost(),
    contentPlanId: 'plan-1',
  };
  return render(<UpdateContentPlanPostDlg {...defaults} {...props} />);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('UpdateContentPlanPostDlg', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdatePost.mockReturnValue({
      unwrap: () => Promise.resolve({ data: makePost(), message: 'Updated' }),
    });
    mockGetContentPlanPosts.mockReturnValue({
      unwrap: () => Promise.resolve({ data: [] }),
    });
  });

  // ── Visibility ─────────────────────────────────────────────────────────────

  it('renders the dialog when open is true', () => {
    renderDialog();
    expect(screen.getByText('Edit Post')).toBeInTheDocument();
  });

  it('does not render the dialog when open is false', () => {
    renderDialog({ open: false });
    expect(screen.queryByText('Edit Post')).not.toBeInTheDocument();
  });

  // ── Form labels ─────────────────────────────────────────────────────────────

  it('renders all field labels', () => {
    renderDialog();
    expect(screen.getByText('Funnel Stage')).toBeInTheDocument();
    expect(screen.getByText('Format')).toBeInTheDocument();
    expect(screen.getByText('Content Type')).toBeInTheDocument();
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Topic')).toBeInTheDocument();
    expect(screen.getByText('Hook')).toBeInTheDocument();
    expect(screen.getByText('Thesis')).toBeInTheDocument();
    expect(screen.getByText('CTA')).toBeInTheDocument();
    expect(screen.getByText('Marketing Goal')).toBeInTheDocument();
    expect(screen.getByText('Design Reference')).toBeInTheDocument();
  });

  // ── Pre-populated values ────────────────────────────────────────────────────

  it('pre-populates the title textarea with the post value', () => {
    renderDialog({ post: makePost({ title: 'My Post Title' }) });
    const titleTextareas = screen.getAllByRole('textbox');
    const titleTextarea = titleTextareas.find(
      (el) => (el as HTMLTextAreaElement).value === 'My Post Title'
    );
    expect(titleTextarea).toBeDefined();
    expect((titleTextarea as HTMLTextAreaElement).value).toBe('My Post Title');
  });

  it('pre-selects the funnel stage select with the post value', () => {
    renderDialog({ post: makePost({ funnelStage: 'MOFU' }) });
    const selects = screen.getAllByRole('combobox') as HTMLSelectElement[];
    const funnelSelect = selects.find((s) => s.value === 'MOFU');
    expect(funnelSelect).toBeDefined();
  });

  it('pre-selects the format select with the post value', () => {
    renderDialog({ post: makePost({ format: 'REELS' }) });
    const selects = screen.getAllByRole('combobox') as HTMLSelectElement[];
    const formatSelect = selects.find((s) => s.value === 'REELS');
    expect(formatSelect).toBeDefined();
  });

  // ── Action buttons ──────────────────────────────────────────────────────────

  it('renders the Save button', () => {
    renderDialog();
    expect(screen.getByRole('button', { name: /^save$/i })).toBeInTheDocument();
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

  // ── Validation ──────────────────────────────────────────────────────────────

  it('shows validation errors when required fields are cleared and form is submitted', async () => {
    renderDialog({ post: makePost({ title: 'Title', hook: 'Hook', thesis: 'Thesis', cta: 'CTA' }) });

    const textboxes = screen.getAllByRole('textbox') as HTMLTextAreaElement[];
    const titleTextarea = textboxes.find((el) => el.value === 'Title')!;
    userEvent.clear(titleTextarea);
    userEvent.click(screen.getByRole('button', { name: /^save$/i }));

    await waitFor(() => {
      expect(screen.getAllByText(/this field is required/i).length).toBeGreaterThan(0);
    });
  });

  // ── Submit ──────────────────────────────────────────────────────────────────

  it('calls updatePost with the correct contentPlanId and day on submit', async () => {
    renderDialog({ post: makePost({ day: 5 }), contentPlanId: 'plan-42' });

    userEvent.click(screen.getByRole('button', { name: /^save$/i }));

    await waitFor(() => {
      expect(mockUpdatePost).toHaveBeenCalled();
      expect(mockUpdatePost.mock.calls[0][0].id).toBe('plan-42');
      expect(mockUpdatePost.mock.calls[0][0].day).toBe(5);
    });
  });

  // ── Photo section — initialisation ─────────────────────────────────────────

  it('renders the Photo label', () => {
    renderDialog();
    expect(screen.getByText('Photo')).toBeInTheDocument();
  });

  it('renders "Select Photo" button when post has no photos', () => {
    renderDialog({ post: makePost({ photos: undefined }) });
    expect(screen.getByRole('button', { name: /select photo/i })).toBeInTheDocument();
  });

  it('renders "Change Photo" button when post already has photos', () => {
    renderDialog({
      post: makePost({
        photos: [{ photoId: 'photo-1', url: 'https://example.com/img.jpg' }],
      }),
    });
    expect(screen.getByRole('button', { name: /change photo/i })).toBeInTheDocument();
  });

  it('renders photo preview thumbnails for each photo in post.photos', () => {
    const { container } = renderDialog({
      post: makePost({
        photos: [
          { photoId: 'photo-1', url: 'https://example.com/img1.jpg' },
          { photoId: 'photo-2', url: 'https://example.com/img2.jpg' },
        ],
      }),
    });

    // Thumbnails use alt="" (decorative) so they don't have role="img" — query via DOM
    const thumbnails = container.querySelectorAll('img');
    expect(thumbnails).toHaveLength(2);
    expect(thumbnails[0]).toHaveAttribute('src', 'https://example.com/img1.jpg');
    expect(thumbnails[1]).toHaveAttribute('src', 'https://example.com/img2.jpg');
  });

  it('initialises photosIds form field from post.photos', async () => {
    renderDialog({
      post: makePost({
        photos: [{ photoId: 'photo-abc', url: 'https://example.com/abc.jpg' }],
      }),
      contentPlanId: 'plan-1',
    });

    userEvent.click(screen.getByRole('button', { name: /^save$/i }));

    await waitFor(() => {
      expect(mockUpdatePost).toHaveBeenCalled();
      const { form } = mockUpdatePost.mock.calls[0][0];
      expect(form.photosIds).toEqual(['photo-abc']);
    });
  });

  it('opens the gallery dialog when the select/change photo button is clicked', () => {
    renderDialog({ post: makePost({ photos: undefined }) });

    userEvent.click(screen.getByRole('button', { name: /select photo/i }));

    expect(screen.getByTestId('mock-gallery')).toBeInTheDocument();
  });

  it('adds selected gallery photos to the form and shows their thumbnails', async () => {
    const { container } = renderDialog({ post: makePost({ photos: undefined }) });

    userEvent.click(screen.getByRole('button', { name: /select photo/i }));
    userEvent.click(screen.getByTestId('mock-gallery'));

    await waitFor(() => {
      // Thumbnails use alt="" (decorative) — query via DOM
      const thumbnails = container.querySelectorAll('img');
      expect(thumbnails).toHaveLength(1);
      expect(thumbnails[0]).toHaveAttribute('src', 'https://example.com/gallery.jpg');
    });
  });

  it('removes a photo thumbnail when its remove button is clicked', async () => {
    const { container } = renderDialog({
      post: makePost({
        photos: [{ photoId: 'photo-1', url: 'https://example.com/img.jpg' }],
      }),
    });

    expect(container.querySelectorAll('img')).toHaveLength(1);

    // The remove button is inside the thumbnail wrapper div (relative/overflow-hidden)
    // It is the only button that is a descendant of the photo preview container
    const photoPreviewContainer = container.querySelector('.flex.gap-2.mb-2') as HTMLElement;
    const removeButton = within(photoPreviewContainer).getByRole('button');
    userEvent.click(removeButton);

    await waitFor(() => {
      expect(container.querySelectorAll('img')).toHaveLength(0);
    });
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SelectGalleryDlg } from './SelectGalleryDlg';
import { GalleryType } from '../../../../../../../../enum/GalleryType';
import { BusinessProfileFocus } from '../../../../../../../../enum/BusinessProfileFocus';
import { TGalleryPhoto } from '../../../../../../../../models/Gallery';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ businessId: 'biz-1' }),
}));

// Mock RTK Query hooks — API calls fire in useEffect but don't affect Redux state in these tests
const mockGetPhotos = jest.fn();
const mockGetDefaultPhotos = jest.fn();

jest.mock('../../../../../../../../store/gallery/galleryApi', () => ({
  useGetPhotosMutation: () => [mockGetPhotos],
  useLazyGetDefaultPhotosQuery: () => [mockGetDefaultPhotos],
}));

// Mock Redux dispatch and selector
const mockDispatch = jest.fn();

// Mutable state shared between tests
let mockGalleryState = { photos: [] as TGalleryPhoto[], defaultPhotos: [] as TGalleryPhoto[] };

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: (selector: (state: unknown) => unknown) =>
    selector({ galleryModule: mockGalleryState }),
}));

jest.mock('../../../../../../../../store/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({ galleryModule: mockGalleryState }),
}));

// Mock showError utility
jest.mock('../../../../../../../../utils/showError', () => ({
  showError: jest.fn(),
}));

// ─── Test data ───────────────────────────────────────────────────────────────

const makePhoto = (id: string, type: GalleryType): TGalleryPhoto => ({
  id,
  url: `https://example.com/${id}.jpg`,
  type,
  businessId: 'biz-1',
  isActive: true,
  description: '',
  createdAt: new Date('2024-01-01'),
});

const imagePhoto = makePhoto('img-1', GalleryType.Image);
const decorationPhoto = makePhoto('dec-1', GalleryType.Decoration);
const postPhoto = makePhoto('post-1', GalleryType.Post);
const storyPhoto = makePhoto('story-1', GalleryType.Story);

const allPhotos = [imagePhoto, decorationPhoto, postPhoto, storyPhoto];

// ─── Helpers ─────────────────────────────────────────────────────────────────

type RenderOptions = {
  selectedIds?: string[];
  focus?: BusinessProfileFocus | null;
};

function renderComponent({
  selectedIds = [],
  focus = BusinessProfileFocus.GeneratePosts,
}: RenderOptions = {}) {
  const onSelect = jest.fn();
  render(
    <SelectGalleryDlg
      onSelect={onSelect}
      selectedIds={selectedIds}
      focus={focus}
    />
  );
  return { onSelect };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('SelectGalleryDlg', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetPhotos.mockResolvedValue({ data: { data: [] } });
    mockGetDefaultPhotos.mockResolvedValue({ data: { data: [] } });
    mockGalleryState = { photos: allPhotos, defaultPhotos: [] };
  });

  // ── 1. Overview mode renders by default ────────────────────────────────────

  describe('overview mode (default)', () => {
    test('renders category labels as rows on initial mount', () => {
      renderComponent({ focus: BusinessProfileFocus.GeneratePosts });

      expect(screen.getByText('Images')).toBeInTheDocument();
      expect(screen.getByText('Templates for Posts')).toBeInTheDocument();
      expect(screen.getByText('Decorations')).toBeInTheDocument();
    });

    test('does not render the Back button in overview mode', () => {
      renderComponent();

      expect(screen.queryByRole('button', { name: /back/i })).not.toBeInTheDocument();
    });
  });

  // ── 2. Click on category transitions to detail mode ────────────────────────

  describe('navigating to detail mode', () => {
    test('clicking a category row enters detail mode and shows its label as heading', () => {
      renderComponent({ focus: BusinessProfileFocus.GeneratePosts });

      userEvent.click(screen.getByText('Images'));

      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
      // Category label is now rendered as a heading in detail view
      expect(screen.getByText('Images')).toBeInTheDocument();
    });

    test('photos for the selected category are displayed in detail mode', () => {
      renderComponent({ focus: BusinessProfileFocus.GeneratePosts });

      userEvent.click(screen.getByText('Images'));

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(1); // only imagePhoto belongs to Image type
    });
  });

  // ── 3. Back button returns to overview ─────────────────────────────────────

  describe('Back button', () => {
    test('clicking Back returns to overview mode showing category rows', () => {
      renderComponent({ focus: BusinessProfileFocus.GeneratePosts });

      userEvent.click(screen.getByText('Images'));
      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();

      userEvent.click(screen.getByRole('button', { name: /back/i }));

      expect(screen.queryByRole('button', { name: /back/i })).not.toBeInTheDocument();
      expect(screen.getByText('Decorations')).toBeInTheDocument();
    });
  });

  // ── 4. Clicking a photo calls onSelect with correct data ───────────────────

  describe('photo selection', () => {
    test('clicking a photo checkbox calls onSelect with that photo', () => {
      const { onSelect } = renderComponent({ focus: BusinessProfileFocus.GeneratePosts });

      userEvent.click(screen.getByText('Images'));

      const [checkbox] = screen.getAllByRole('checkbox');
      userEvent.click(checkbox);

      expect(onSelect).toHaveBeenCalledTimes(1);
      const [selected] = onSelect.mock.calls[0] as [TGalleryPhoto[]];
      expect(selected).toHaveLength(1);
      expect(selected[0].id).toBe('img-1');
    });

    test('clicking the same photo again deselects it and calls onSelect with empty array', () => {
      const { onSelect } = renderComponent({ focus: BusinessProfileFocus.GeneratePosts });

      userEvent.click(screen.getByText('Images'));

      const [checkbox] = screen.getAllByRole('checkbox');
      userEvent.click(checkbox); // select
      userEvent.click(checkbox); // deselect

      const lastCall = onSelect.mock.calls[onSelect.mock.calls.length - 1] as [TGalleryPhoto[]];
      expect(lastCall[0]).toHaveLength(0);
    });
  });

  // ── 5. MAX_SELECTED = 3 limit ──────────────────────────────────────────────

  describe('MAX_SELECTED limit', () => {
    test('disables unchecked checkboxes once 3 photos are already selected', () => {
      // Provide 4 image photos so we can fill up the limit and still have one left
      const extraPhotos = [
        makePhoto('img-1', GalleryType.Image),
        makePhoto('img-2', GalleryType.Image),
        makePhoto('img-3', GalleryType.Image),
        makePhoto('img-4', GalleryType.Image),
      ];
      mockGalleryState = { photos: extraPhotos, defaultPhotos: [] };

      renderComponent({ selectedIds: ['img-1', 'img-2', 'img-3'], focus: BusinessProfileFocus.GeneratePosts });

      userEvent.click(screen.getByText('Images'));

      const checkboxes = screen.getAllByRole('checkbox');
      // The 3 already-selected ones should be enabled (user can deselect them)
      const selected = checkboxes.filter(cb => (cb as HTMLInputElement).checked);
      const unselected = checkboxes.filter(cb => !(cb as HTMLInputElement).checked);

      expect(selected).toHaveLength(3);
      // The 4th (unselected) checkbox must be disabled because limit is reached
      expect(unselected[0]).toBeDisabled();
    });

    test('does not disable checkboxes when fewer than 3 photos are selected', () => {
      renderComponent({ selectedIds: ['img-1'], focus: BusinessProfileFocus.GeneratePosts });

      userEvent.click(screen.getByText('Images'));

      const checkboxes = screen.getAllByRole('checkbox');
      const disabledCheckboxes = checkboxes.filter(cb => (cb as HTMLInputElement).disabled);
      expect(disabledCheckboxes).toHaveLength(0);
    });
  });

  // ── 6. focus === GeneratePosts ─────────────────────────────────────────────

  describe('focus = GeneratePosts', () => {
    test('shows "Templates for Posts" category row', () => {
      renderComponent({ focus: BusinessProfileFocus.GeneratePosts });

      expect(screen.getByText('Templates for Posts')).toBeInTheDocument();
    });

    test('does not show "Templates for Stories" category row', () => {
      renderComponent({ focus: BusinessProfileFocus.GeneratePosts });

      expect(screen.queryByText('Templates for Stories')).not.toBeInTheDocument();
    });
  });

  // ── 7. focus === GenerateStories ───────────────────────────────────────────

  describe('focus = GenerateStories', () => {
    test('shows "Templates for Stories" category row', () => {
      renderComponent({ focus: BusinessProfileFocus.GenerateStories });

      expect(screen.getByText('Templates for Stories')).toBeInTheDocument();
    });

    test('does not show "Templates for Posts" category row', () => {
      renderComponent({ focus: BusinessProfileFocus.GenerateStories });

      expect(screen.queryByText('Templates for Posts')).not.toBeInTheDocument();
    });
  });

  // ── 8. focus === null (Images and Decorations only) ────────────────────────

  describe('focus = null', () => {
    test('shows Images and Decorations categories', () => {
      mockGalleryState = {
        photos: [
          makePhoto('img-1', GalleryType.Image),
          makePhoto('dec-1', GalleryType.Decoration),
        ],
        defaultPhotos: [],
      };

      renderComponent({ focus: null as any });

      expect(screen.getByText('Images')).toBeInTheDocument();
      expect(screen.getByText('Decorations')).toBeInTheDocument();
    });

    test('does not show Post or Story templates when focus is null', () => {
      mockGalleryState = {
        photos: [
          makePhoto('post-1', GalleryType.Post),
          makePhoto('story-1', GalleryType.Story),
        ],
        defaultPhotos: [],
      };

      renderComponent({ focus: null as any });

      expect(screen.queryByText('Templates for Posts')).not.toBeInTheDocument();
      expect(screen.queryByText('Templates for Stories')).not.toBeInTheDocument();
    });
  });
});

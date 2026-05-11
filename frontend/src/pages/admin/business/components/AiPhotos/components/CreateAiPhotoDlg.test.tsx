import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { CreateAiPhotoDlg } from './CreateAiPhotoDlg';

jest.mock('react-toastify', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const mockGeneratePhoto = jest.fn();
jest.mock('../../../../../../store/gallery/galleryApi', () => ({
  useGenerateAiPhotoMutation: () => [mockGeneratePhoto, { isLoading: false }],
}));

jest.mock('../../Gallery/components/selectGalleryDlg/SelectGalleryDlg', () => ({
  SelectGalleryDlg: ({ focus }: { focus: string | null }) => (
    <div data-testid="select-gallery-dlg" data-focus={focus ?? 'null'} />
  ),
}));

let mockGalleryState = { photos: [], defaultPhotos: [], aiPhotos: [] };

jest.mock('../../../../../../store/hooks', () => ({
  useAppDispatch: () => jest.fn(),
  useAppSelector: (selector: any) => selector({ galleryModule: mockGalleryState }),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ businessId: 'biz-1' }),
}));

const store = configureStore({ reducer: { galleryModule: () => mockGalleryState } });

function renderDialog(props: Partial<{ open: boolean; onClose: () => void; onSuccess: () => void }> = {}) {
  const defaults = { open: true, onClose: jest.fn(), onSuccess: jest.fn() };
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <CreateAiPhotoDlg {...defaults} {...props} />
      </MemoryRouter>
    </Provider>
  );
}

describe('CreateAiPhotoDlg', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when open=true', () => {
    renderDialog({ open: true });
    expect(screen.getByText('Generate AI Photo')).toBeInTheDocument();
  });

  it('does not render when open=false', () => {
    renderDialog({ open: false });
    expect(screen.queryByText('Generate AI Photo')).not.toBeInTheDocument();
  });

  it('Generate button is disabled when prompt is empty', () => {
    renderDialog();
    const btn = screen.getByRole('button', { name: /generate/i });
    expect(btn).toBeDisabled();
  });

  it('Generate button is enabled when prompt has text', () => {
    renderDialog();
    const textarea = screen.getByPlaceholderText(/describe the photo/i);
    userEvent.type(textarea, 'a sunset over mountains');
    const btn = screen.getByRole('button', { name: /generate/i });
    expect(btn).not.toBeDisabled();
  });

  it('calls generatePhoto with correct args on submit', async () => {
    const unwrapResult = { data: { id: '1', url: 'x.jpg' }, message: 'Done' };
    mockGeneratePhoto.mockReturnValue({ unwrap: () => Promise.resolve(unwrapResult) });
    renderDialog();
    userEvent.type(screen.getByPlaceholderText(/describe the photo/i), 'a mountain');
    userEvent.click(screen.getByRole('button', { name: /generate/i }));
    await waitFor(() => {
      expect(mockGeneratePhoto).toHaveBeenCalledWith({
        id: 'biz-1',
        form: { prompt: 'a mountain', photosIds: [], defaultPhotosIds: [] },
      });
    });
  });

  it('calls onSuccess and onClose after successful generation', async () => {
    const onSuccess = jest.fn();
    const onClose = jest.fn();
    const unwrapResult = { data: { id: '1' }, message: 'Done' };
    mockGeneratePhoto.mockReturnValue({ unwrap: () => Promise.resolve(unwrapResult) });
    renderDialog({ onSuccess, onClose });
    userEvent.type(screen.getByPlaceholderText(/describe the photo/i), 'a mountain');
    userEvent.click(screen.getByRole('button', { name: /generate/i }));
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('renders SelectGalleryDlg with focus=null', () => {
    renderDialog();
    const gallery = screen.getByTestId('select-gallery-dlg');
    expect(gallery).toBeInTheDocument();
    expect(gallery.getAttribute('data-focus')).toBe('null');
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = jest.fn();
    renderDialog({ onClose });
    userEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalled();
  });
});

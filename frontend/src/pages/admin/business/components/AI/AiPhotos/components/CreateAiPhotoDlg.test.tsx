import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { CreateAiPhotoDlg } from './CreateAiPhotoDlg';

jest.mock('react-toastify', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const mockGeneratePhoto = jest.fn();
jest.mock('../../../../../../../store/gallery/galleryApi', () => ({
  useGenerateAiPhotoMutation: () => [mockGeneratePhoto, { isLoading: false }],
  useGetPhotosMutation: () => [jest.fn().mockReturnValue({ unwrap: () => Promise.resolve({ data: [] }) }), {}],
  useLazyGetDefaultPhotosQuery: () => [jest.fn().mockReturnValue({ unwrap: () => Promise.resolve({ data: [] }) })],
}));

jest.mock('../../../Assets/Gallery/components/selectGalleryDlg/SelectGalleryDlg', () => ({
  SelectGalleryDlg: ({
    focus,
    onSelect,
  }: {
    focus: string | null;
    onSelect: (photos: { id: string; isDefault: boolean }[]) => void;
  }) => (
    <div data-testid="select-gallery-dlg" data-focus={focus ?? 'null'}>
      <button
        onClick={() => onSelect([
          { id: 'biz-photo-1', isDefault: false },
          { id: 'def-photo-1', isDefault: true },
        ])}
      >
        Select Photos
      </button>
    </div>
  ),
}));

const mockGalleryState = { photos: [], defaultPhotos: [], aiPhotos: [] };

jest.mock('../../../../../../../store/hooks', () => ({
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
    expect(screen.getByRole('button', { name: /generate/i })).toBeDisabled();
  });

  it('Generate button is enabled when prompt has text', () => {
    renderDialog();
    userEvent.type(screen.getByPlaceholderText(/enter prompt/i), 'a sunset over mountains');
    expect(screen.getByRole('button', { name: /generate/i })).not.toBeDisabled();
  });

  it('calls generatePhoto with correct args on submit', async () => {
    mockGeneratePhoto.mockReturnValue({ unwrap: () => Promise.resolve({ data: { id: '1', url: 'x.jpg' }, message: 'Done' }) });
    renderDialog();
    userEvent.type(screen.getByPlaceholderText(/enter prompt/i), 'a mountain');
    userEvent.click(screen.getByRole('button', { name: /generate/i }));
    await waitFor(() => {
      expect(mockGeneratePhoto).toHaveBeenCalledWith({
        id: 'biz-1',
        form: expect.objectContaining({
          prompt: 'a mountain',
          photosIds: [],
          defaultPhotosIds: [],
          aspectRatio: '1:1',
        }),
      });
    });
  });

  it('calls onSuccess and onClose after successful generation', async () => {
    const onSuccess = jest.fn();
    const onClose = jest.fn();
    mockGeneratePhoto.mockReturnValue({ unwrap: () => Promise.resolve({ data: { id: '1' }, message: 'Done' }) });
    renderDialog({ onSuccess, onClose });
    userEvent.type(screen.getByPlaceholderText(/enter prompt/i), 'a mountain');
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

  // Aspect ratio tests
  describe('aspect ratio', () => {
    it('renders all three aspect ratio options', () => {
      renderDialog();
      const radios = screen.getAllByRole('radio') as HTMLInputElement[];
      const values = radios.map((r) => r.value);
      expect(values).toContain('16:9');
      expect(values).toContain('4:5');
      expect(values).toContain('1:1');
    });

    it('selects 1:1 by default', () => {
      renderDialog();
      const radios = screen.getAllByRole('radio') as HTMLInputElement[];
      const selected = radios.find((r) => r.checked);
      expect(selected?.value).toBe('1:1');
    });

    it('changes selection when a different ratio is clicked', () => {
      renderDialog();
      const radio169 = screen.getAllByRole('radio').find(
        (r) => (r as HTMLInputElement).value === '16:9'
      ) as HTMLInputElement;
      userEvent.click(radio169);
      expect(radio169.checked).toBe(true);
      const radio11 = screen.getAllByRole('radio').find(
        (r) => (r as HTMLInputElement).value === '1:1'
      ) as HTMLInputElement;
      expect(radio11.checked).toBe(false);
    });

    it('sends the selected aspectRatio in the API call payload', async () => {
      mockGeneratePhoto.mockReturnValue({ unwrap: () => Promise.resolve({ data: { id: '1' }, message: 'Done' }) });
      renderDialog();
      const radio45 = screen.getAllByRole('radio').find(
        (r) => (r as HTMLInputElement).value === '4:5'
      ) as HTMLInputElement;
      userEvent.click(radio45);
      userEvent.type(screen.getByPlaceholderText(/enter prompt/i), 'a portrait');
      userEvent.click(screen.getByRole('button', { name: /generate/i }));
      await waitFor(() => {
        expect(mockGeneratePhoto).toHaveBeenCalledWith({
          id: 'biz-1',
          form: expect.objectContaining({ aspectRatio: '4:5' }),
        });
      });
    });
  });

  describe('form reset after successful generation', () => {
    beforeEach(() => {
      mockGeneratePhoto.mockReturnValue({
        unwrap: () => Promise.resolve({ data: { id: 'new-1', url: 'result.jpg' }, message: 'Generated!' }),
      });
    });

    it('clears the prompt textarea after successful generation', async () => {
      renderDialog();
      userEvent.type(screen.getByPlaceholderText(/enter prompt/i), 'a city at night');
      userEvent.click(screen.getByRole('button', { name: /generate/i }));
      await waitFor(() => {
        expect((screen.getByPlaceholderText(/enter prompt/i) as HTMLTextAreaElement).value).toBe('');
      });
    });

    it('resets aspectRatio back to 1:1 after successful generation', async () => {
      renderDialog();
      const radio169 = screen.getAllByRole('radio').find(
        (r) => (r as HTMLInputElement).value === '16:9'
      ) as HTMLInputElement;
      userEvent.click(radio169);
      expect(radio169.checked).toBe(true);

      userEvent.type(screen.getByPlaceholderText(/enter prompt/i), 'a beach scene');
      userEvent.click(screen.getByRole('button', { name: /generate/i }));

      await waitFor(() => {
        const radio11 = screen.getAllByRole('radio').find(
          (r) => (r as HTMLInputElement).value === '1:1'
        ) as HTMLInputElement;
        expect(radio11.checked).toBe(true);
      });
    });

    it('removes selected photos from the prompt area after successful generation', async () => {
      renderDialog();
      userEvent.click(screen.getByRole('button', { name: /select photos/i }));
      userEvent.type(screen.getByPlaceholderText(/enter prompt/i), 'a forest');
      userEvent.click(screen.getByRole('button', { name: /generate/i }));

      await waitFor(() => {
        expect(mockGeneratePhoto).toHaveBeenCalledWith({
          id: 'biz-1',
          form: expect.objectContaining({
            photosIds: ['biz-photo-1'],
            defaultPhotosIds: ['def-photo-1'],
          }),
        });
      });

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: '' })).not.toBeInTheDocument();
      });
    });

    it('sends photosIds and defaultPhotosIds as empty arrays when no photos are selected', async () => {
      renderDialog();
      userEvent.type(screen.getByPlaceholderText(/enter prompt/i), 'mountains');
      userEvent.click(screen.getByRole('button', { name: /generate/i }));

      await waitFor(() => {
        expect(mockGeneratePhoto).toHaveBeenCalledWith({
          id: 'biz-1',
          form: expect.objectContaining({
            photosIds: [],
            defaultPhotosIds: [],
          }),
        });
      });
    });

    it('calls toast.success with the response message on successful generation', async () => {
      const { toast } = require('react-toastify');
      renderDialog();
      userEvent.type(screen.getByPlaceholderText(/enter prompt/i), 'sunset');
      userEvent.click(screen.getByRole('button', { name: /generate/i }));
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Generated!');
      });
    });

    it('does not reset the form when generation returns no data', async () => {
      mockGeneratePhoto.mockReturnValue({
        unwrap: () => Promise.resolve({ data: null, message: 'No data' }),
      });
      renderDialog();
      userEvent.type(screen.getByPlaceholderText(/enter prompt/i), 'a lake');
      userEvent.click(screen.getByRole('button', { name: /generate/i }));

      await waitFor(() => {
        expect(mockGeneratePhoto).toHaveBeenCalledTimes(1);
      });

      expect((screen.getByPlaceholderText(/enter prompt/i) as HTMLTextAreaElement).value).toBe('a lake');
    });

    it('does not reset the form when generation throws an error', async () => {
      mockGeneratePhoto.mockReturnValue({
        unwrap: () => Promise.reject(new Error('Server error')),
      });
      renderDialog();
      userEvent.type(screen.getByPlaceholderText(/enter prompt/i), 'a desert');
      userEvent.click(screen.getByRole('button', { name: /generate/i }));

      await waitFor(() => {
        expect(mockGeneratePhoto).toHaveBeenCalledTimes(1);
      });

      expect((screen.getByPlaceholderText(/enter prompt/i) as HTMLTextAreaElement).value).toBe('a desert');
    });
  });
});

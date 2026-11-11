import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import UploadDesignSystemDlg from './UploadDesignSystemDlg';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockDispatch = jest.fn();

jest.mock('../../../../../../../../store/hooks', () => ({
  useAppDispatch: () => mockDispatch,
}));

const mockMutate = jest.fn();

jest.mock('../../../../../../../../store/designSystem/designSystemApi', () => ({
  useCreateDesignSystemFromPhotoMutation: () => [mockMutate, { isLoading: false }],
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ businessId: 'biz-1' }),
}));

jest.mock('react-toastify', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock('../../../../../../../../utils/validations', () => ({
  isValidPhoto: jest.fn(),
}));

jest.mock('../../../../../../../../utils/showError', () => ({
  showError: jest.fn(),
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

function renderDialog(open: boolean, onClose = jest.fn()) {
  return render(<UploadDesignSystemDlg open={open} onClose={onClose} />);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('UploadDesignSystemDlg', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('does not render when open is false', () => {
    renderDialog(false);
    expect(screen.queryByText('Upload Design Photo')).not.toBeInTheDocument();
  });

  test('renders dialog when open is true', () => {
    renderDialog(true);
    expect(screen.getByText('Upload Design Photo')).toBeInTheDocument();
  });

  test('shows file upload zone with "Choose a photo" text', () => {
    renderDialog(true);
    expect(screen.getByText('Choose a photo')).toBeInTheDocument();
  });

  test('shows name input with correct placeholder', () => {
    renderDialog(true);
    expect(
      screen.getByPlaceholderText('My Brand Design System')
    ).toBeInTheDocument();
  });

  test('Create button is disabled when no file is selected', () => {
    renderDialog(true);
    expect(screen.getByRole('button', { name: /create/i })).toBeDisabled();
  });

  test('calls onClose when Cancel button is clicked', () => {
    const onClose = jest.fn();
    renderDialog(true, onClose);
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('calls onClose when X button is clicked', () => {
    const onClose = jest.fn();
    renderDialog(true, onClose);
    // The X button has an SVG inside; find by its position in the header
    const closeButton = screen
      .getAllByRole('button')
      .find((btn) => !btn.textContent?.trim());
    expect(closeButton).toBeDefined();
    fireEvent.click(closeButton!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

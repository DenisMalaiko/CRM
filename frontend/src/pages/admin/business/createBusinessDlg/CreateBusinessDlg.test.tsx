import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import businessReducer from '../../../../store/businesses/businessesSlice';
import authReducer from '../../../../store/auth/authSlice';
import { CreateBusinessDlg } from './CreateBusinessDlg';

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('react-toastify', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const mockCreateBusiness = jest.fn();
const mockUpdateBusiness = jest.fn();
const mockGetBusinesses = jest.fn();

jest.mock('../../../../store/businesses/businessesApi', () => ({
  useCreateBusinessMutation: () => [mockCreateBusiness, { isLoading: false }],
  useUpdateBusinessMutation: () => [mockUpdateBusiness, { isLoading: false }],
  useGetBusinessesMutation: () => [mockGetBusinesses, { isLoading: false }],
}));

// Render react-select as a plain <select> so standard RTL queries work
jest.mock('react-select', () => ({
  __esModule: true,
  default: ({ options, onChange, placeholder, value }: any) => (
    <select
      aria-label={placeholder}
      value={value ? value.value : ''}
      onChange={(e) => {
        const selected = options.find((o: any) => o.value === e.target.value);
        onChange(selected ?? null);
      }}
    >
      <option value="">{placeholder}</option>
      {options.map((o: any) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  ),
}));

jest.mock('../../../../utils/showError', () => ({ showError: jest.fn() }));

// ── Store helper ──────────────────────────────────────────────────────────────
const rootReducer = combineReducers({
  authModule: authReducer,
  businessModule: businessReducer,
});

function makeStore(preloadedState?: Partial<ReturnType<typeof rootReducer>>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
  });
}

const defaultAuthState = {
  authModule: {
    user: { id: 'user-1', agencyId: 'agency-1', email: 'admin@example.com' },
    token: 'test-token',
    isLoading: false,
    error: null,
  },
};

function renderDialog(
  props: Partial<{
    open: boolean;
    onClose: () => void;
    business: any;
  }> = {},
  storeState: Record<string, unknown> = defaultAuthState
) {
  const defaults = { open: true, onClose: jest.fn(), business: null };
  const store = makeStore(storeState);
  return {
    store,
    onClose: props.onClose ?? defaults.onClose,
    ...render(
      <Provider store={store}>
        <CreateBusinessDlg {...defaults} {...props} />
      </Provider>
    ),
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('CreateBusinessDlg — Country field', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetBusinesses.mockReturnValue({ unwrap: () => Promise.resolve({ data: [] }) });
    mockCreateBusiness.mockReturnValue({
      unwrap: () => Promise.resolve({ data: { id: 'biz-1' }, message: 'Created' }),
    });
    mockUpdateBusiness.mockReturnValue({
      unwrap: () => Promise.resolve({ data: { id: 'biz-1' }, message: 'Updated' }),
    });
  });

  // ── 1. Renders ─────────────────────────────────────────────────────────────

  it('renders the Country label in the dialog', () => {
    renderDialog();
    expect(screen.getByText('Country')).toBeInTheDocument();
  });

  it('renders the Country select with placeholder option', () => {
    renderDialog();
    expect(screen.getByRole('combobox', { name: /select country/i })).toBeInTheDocument();
  });

  it('does not render the dialog when open is false', () => {
    renderDialog({ open: false });
    expect(screen.queryByText('Country')).not.toBeInTheDocument();
  });

  // ── 2. Selecting a country updates form state ──────────────────────────────

  it('reflects the selected country value in the combobox after selection', () => {
    renderDialog();

    const countrySelect = screen.getByRole('combobox', { name: /select country/i });
    userEvent.selectOptions(countrySelect, 'US');

    expect((countrySelect as HTMLSelectElement).value).toBe('US');
  });

  it('updates the combobox value when a different country is selected', () => {
    renderDialog();

    const countrySelect = screen.getByRole('combobox', { name: /select country/i });
    userEvent.selectOptions(countrySelect, 'DE');

    expect((countrySelect as HTMLSelectElement).value).toBe('DE');
  });

  // ── 3. Validation error when country is empty on submit ───────────────────

  it('shows a validation error for Country when the form is submitted without selecting a country', async () => {
    renderDialog();

    // Submit without selecting a country — validateAll fires and sets all field errors
    userEvent.click(screen.getByRole('button', { name: /save/i }));

    // country validator uses isRequired which returns "This field is required"
    const errors = await screen.findAllByText('This field is required');
    expect(errors.length).toBeGreaterThan(0);
  });

  it('does not show a country validation error after a valid country is selected', () => {
    renderDialog();

    const countrySelect = screen.getByRole('combobox', { name: /select country/i });
    userEvent.selectOptions(countrySelect, 'US');

    expect(screen.queryByText(/this field is required/i)).not.toBeInTheDocument();
  });

  // ── 4. Country value is included in the mutation payload ──────────────────

  it('includes the selected country in the createBusiness mutation payload', async () => {
    renderDialog();

    userEvent.type(screen.getByPlaceholderText(/enter name/i), 'My Company');
    userEvent.type(screen.getByPlaceholderText(/enter website/i), 'https://mycompany.com');
    userEvent.type(screen.getByPlaceholderText(/enter about brand/i), 'Brand text');
    userEvent.type(screen.getByPlaceholderText(/enter advantage/i), 'Great quality');
    userEvent.type(screen.getByPlaceholderText(/enter goal/i), 'Grow revenue');

    userEvent.selectOptions(screen.getByRole('combobox', { name: /select country/i }), 'UA');
    userEvent.selectOptions(screen.getByRole('combobox', { name: /select language/i }), 'en');

    userEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockCreateBusiness).toHaveBeenCalled();
      const payload = mockCreateBusiness.mock.calls[0][0];
      expect(payload).toMatchObject({ country: 'UA' });
    });
  });

  it('includes the updated country in the updateBusiness mutation payload when editing', async () => {
    const existingBusiness = {
      id: 'biz-1',
      name: 'Existing Biz',
      website: 'https://existing.com',
      industry: 'Tech',
      status: 'Active',
      agencyId: 'agency-1',
      brand: 'Some brand',
      advantages: ['Advantage 1'],
      goals: ['Goal 1'],
      language: 'en',
      country: 'DE',
    };

    renderDialog({ business: existingBusiness });

    userEvent.selectOptions(screen.getByRole('combobox', { name: /select country/i }), 'FR');

    userEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockUpdateBusiness).toHaveBeenCalled();
      const payload = mockUpdateBusiness.mock.calls[0][0];
      expect(payload.form).toMatchObject({ country: 'FR' });
    });
  });

  // ── 5. Pre-populated country when editing ─────────────────────────────────

  it('pre-populates the Country select with the existing business country in edit mode', () => {
    const existingBusiness = {
      id: 'biz-1',
      name: 'Biz',
      website: 'https://biz.com',
      industry: 'Tech',
      status: 'Active',
      agencyId: 'agency-1',
      brand: '',
      advantages: [''],
      goals: [''],
      language: 'en',
      country: 'GB',
    };

    renderDialog({ business: existingBusiness });

    const countrySelect = screen.getByRole('combobox', { name: /select country/i });
    expect((countrySelect as HTMLSelectElement).value).toBe('GB');
  });
});

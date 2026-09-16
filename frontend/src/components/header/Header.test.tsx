import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import authReducer from '../../store/auth/authSlice';
import adminReducer from '../../store/admin/adminSlice';
import Header from './Header';

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('react-toastify', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock('../../store/auth/authApi', () => ({
  useSignOutUserMutation: () => [jest.fn()],
}));

jest.mock('../../store/admin/adminApi', () => ({
  useSignOutAdminMutation: () => [jest.fn()],
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => {
      if (key === 'Header.adminLabel') return `Admin: ${opts?.name}`;
      if (key === 'Header.welcomeUser') return `Welcome, ${opts?.name}`;
      if (key === 'Header.signIn') return 'Sign In';
      if (key === 'Header.signUp') return 'Sign Up';
      if (key === 'Header.signOut') return 'Sign Out';
      return key;
    },
    i18n: { language: 'en', changeLanguage: jest.fn() },
  }),
}));

// ── Store helper ──────────────────────────────────────────────────────────────

type StoreOverrides = {
  authModule?: Partial<ReturnType<typeof authReducer>>;
  adminModule?: Partial<ReturnType<typeof adminReducer>>;
};

const rootReducer = combineReducers({
  authModule: authReducer,
  adminModule: adminReducer,
});

function makeStore(overrides: StoreOverrides = {}) {
  return configureStore({
    reducer: rootReducer,
    preloadedState: overrides as any,
  });
}

function renderHeader(overrides: StoreOverrides = {}) {
  return render(
    <Provider store={makeStore(overrides)}>
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    </Provider>
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Header', () => {

  // ── LanguageSwitcher ───────────────────────────────────────────────────────

  it('renders the LanguageSwitcher combobox', () => {
    renderHeader();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders EN and UA language options', () => {
    renderHeader();
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    const options = Array.from(select.options).map((o) => o.value);
    expect(options).toContain('en');
    expect(options).toContain('ua');
  });

  // ── Unauthenticated — auth links ───────────────────────────────────────────

  it('renders Sign In link when no user is authenticated', () => {
    renderHeader();
    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
  });

  it('renders Sign Up link when no user is authenticated', () => {
    renderHeader();
    expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument();
  });

  it('Sign In link points to /signIn', () => {
    renderHeader();
    expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute('href', '/signIn');
  });

  it('Sign Up link points to /signUp', () => {
    renderHeader();
    expect(screen.getByRole('link', { name: /sign up/i })).toHaveAttribute('href', '/signUp');
  });

  it('does not render Sign Out when no user is authenticated', () => {
    renderHeader();
    expect(screen.queryByText(/sign out/i)).not.toBeInTheDocument();
  });

  // ── Authenticated user ─────────────────────────────────────────────────────

  it('renders welcome link with user name when a user is authenticated', () => {
    renderHeader({
      authModule: {
        isAuthenticatedUser: true,
        user: { id: 'u1', name: 'Alice', email: 'alice@example.com' } as any,
      },
    });
    expect(screen.getByRole('link', { name: /welcome, alice/i })).toBeInTheDocument();
  });

  it('renders Sign Out when a user is authenticated', () => {
    renderHeader({
      authModule: {
        isAuthenticatedUser: true,
        user: { id: 'u1', name: 'Alice', email: 'alice@example.com' } as any,
      },
    });
    expect(screen.getByText(/sign out/i)).toBeInTheDocument();
  });

  it('does not render Sign In / Sign Up links when a user is authenticated', () => {
    renderHeader({
      authModule: {
        isAuthenticatedUser: true,
        user: { id: 'u1', name: 'Alice', email: 'alice@example.com' } as any,
      },
    });
    expect(screen.queryByRole('link', { name: /sign in/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /sign up/i })).not.toBeInTheDocument();
  });

  // ── Authenticated admin ────────────────────────────────────────────────────

  it('renders admin label with admin name when an admin is authenticated', () => {
    renderHeader({
      adminModule: {
        isAuthenticatedAdmin: true,
        admin: { id: 'a1', name: 'Bob', email: 'bob@example.com' } as any,
      },
    });
    expect(screen.getByRole('link', { name: /admin: bob/i })).toBeInTheDocument();
  });

  it('renders Sign Out when an admin is authenticated', () => {
    renderHeader({
      adminModule: {
        isAuthenticatedAdmin: true,
        admin: { id: 'a1', name: 'Bob', email: 'bob@example.com' } as any,
      },
    });
    expect(screen.getByText(/sign out/i)).toBeInTheDocument();
  });

  it('admin link points to /admin/list', () => {
    renderHeader({
      adminModule: {
        isAuthenticatedAdmin: true,
        admin: { id: 'a1', name: 'Bob', email: 'bob@example.com' } as any,
      },
    });
    expect(screen.getByRole('link', { name: /admin: bob/i })).toHaveAttribute('href', '/admin/list');
  });

  // ── Logo ───────────────────────────────────────────────────────────────────

  it('renders the CRM logo link pointing to /', () => {
    renderHeader();
    expect(screen.getByRole('link', { name: /crm/i })).toHaveAttribute('href', '/');
  });
});

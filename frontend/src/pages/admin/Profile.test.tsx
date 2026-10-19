import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Profile from './Profile';

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'Sidebar.dashboard': 'Dashboard',
        'Sidebar.businesses': 'Businesses',
      };
      return translations[key] ?? key;
    },
    i18n: { language: 'en', changeLanguage: jest.fn() },
  }),
}));

// react-router Outlet requires a matched route — stub it out
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Outlet: () => null,
}));

// ── Helper ────────────────────────────────────────────────────────────────────

function renderProfile() {
  return render(
    <MemoryRouter initialEntries={['/admin/dashboard']}>
      <Profile />
    </MemoryRouter>
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Profile sidebar', () => {

  // ── NavLinks ───────────────────────────────────────────────────────────────

  it('renders the Dashboard NavLink', () => {
    renderProfile();
    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
  });

  it('renders the Businesses NavLink', () => {
    renderProfile();
    expect(screen.getByRole('link', { name: /businesses/i })).toBeInTheDocument();
  });

  // ── Toggle button ──────────────────────────────────────────────────────────

  it('renders a toggle button in the sidebar', () => {
    renderProfile();
    // The toggle button is the first (and only) button in the sidebar
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('shows ChevronLeft icon when sidebar is expanded', () => {
    renderProfile();
    const toggleButton = screen.getByRole('button');
    expect(toggleButton.querySelector('svg.lucide-chevron-left')).toBeInTheDocument();
    expect(toggleButton.querySelector('svg.lucide-chevron-right')).not.toBeInTheDocument();
  });

  // ── Collapse: text hidden ──────────────────────────────────────────────────

  it('hides NavLink text after clicking the toggle button', () => {
    renderProfile();

    expect(screen.getByRole('link', { name: /dashboard/i })).toHaveTextContent('Dashboard');
    expect(screen.getByRole('link', { name: /businesses/i })).toHaveTextContent('Businesses');

    userEvent.click(screen.getByRole('button'));

    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    expect(screen.queryByText('Businesses')).not.toBeInTheDocument();
  });

  // ── Collapse: sidebar width class ─────────────────────────────────────────

  it('changes sidebar width from w-64 to w-16 after clicking the toggle button', () => {
    const { container } = renderProfile();
    const aside = container.querySelector('aside') as HTMLElement;

    expect(aside).toHaveClass('w-64');
    expect(aside).not.toHaveClass('w-16');

    userEvent.click(screen.getByRole('button'));

    expect(aside).toHaveClass('w-16');
    expect(aside).not.toHaveClass('w-64');
  });

  // ── Collapsed state: icons with title attributes ───────────────────────────

  it('adds title attributes to NavLinks when sidebar is collapsed', () => {
    renderProfile();

    userEvent.click(screen.getByRole('button'));

    const links = screen.getAllByRole('link');
    const dashboardLink = links.find(l => l.getAttribute('href') === '/admin/dashboard/dashboard' || l.getAttribute('title') === 'Dashboard');
    const businessesLink = links.find(l => l.getAttribute('title') === 'Businesses');

    // At least one link carries the Businesses title in collapsed mode
    expect(businessesLink).toBeDefined();
    expect(businessesLink).toHaveAttribute('title', 'Businesses');
  });

  it('shows ChevronRight icon after collapsing', () => {
    renderProfile();

    userEvent.click(screen.getByRole('button'));

    const toggleButton = screen.getByRole('button');
    expect(toggleButton.querySelector('svg.lucide-chevron-right')).toBeInTheDocument();
    expect(toggleButton.querySelector('svg.lucide-chevron-left')).not.toBeInTheDocument();
  });

  // ── Double-click toggle restores expanded state ────────────────────────────

  it('restores expanded state after clicking the toggle button twice', () => {
    const { container } = renderProfile();
    const aside = container.querySelector('aside') as HTMLElement;
    const toggleButton = screen.getByRole('button');

    userEvent.click(toggleButton);
    expect(aside).toHaveClass('w-16');

    userEvent.click(toggleButton);
    expect(aside).toHaveClass('w-64');
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Businesses')).toBeInTheDocument();
  });
});

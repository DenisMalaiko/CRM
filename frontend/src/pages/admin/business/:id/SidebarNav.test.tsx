import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { SidebarNav } from './SidebarNav';

// ── Helpers ────────────────────────────────────────────────────────────────────

function renderAt(pathname: string) {
  return render(
    <MemoryRouter initialEntries={[pathname]}>
      <SidebarNav />
    </MemoryRouter>
  );
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('SidebarNav', () => {

  // ── Group headers ──────────────────────────────────────────────────────────

  it('renders all 7 group headers', () => {
    renderAt('/baseData');

    expect(screen.getByRole('button', { name: /base data/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /generation/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /content plan/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /creator/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /competitors/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ai/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /trends/i })).toBeInTheDocument();
  });

  // ── Auto-expand on route ───────────────────────────────────────────────────

  it('auto-expands the "Generation" group when the route contains "/posts"', () => {
    renderAt('/posts');

    expect(screen.getByRole('link', { name: /^posts$/i })).toBeVisible();
    expect(screen.getByRole('link', { name: /stories/i })).toBeVisible();
  });

  it('auto-expands the "Base Data" group when no matching route segment is found (fallback index 0)', () => {
    renderAt('/unknown-page');

    expect(screen.getByRole('link', { name: /base data/i })).toBeVisible();
    expect(screen.getByRole('link', { name: /products/i })).toBeVisible();
    expect(screen.getByRole('link', { name: /audiences/i })).toBeVisible();
  });

  it('auto-expands the "Competitors" group when the route contains "/competitors"', () => {
    renderAt('/competitors');

    expect(screen.getByRole('link', { name: /^competitors$/i })).toBeVisible();
    expect(screen.getByRole('link', { name: /facebook ideas/i })).toBeVisible();
  });

  it('auto-expands the "Trends" group when the route contains "/trends"', () => {
    renderAt('/trends');

    expect(screen.getByRole('link', { name: /tiktok/i })).toBeVisible();
  });

  // ── Toggle behaviour ───────────────────────────────────────────────────────

  it('opens a closed group when its header is clicked', () => {
    renderAt('/baseData');

    // "Generation" starts closed — click to open
    userEvent.click(screen.getByRole('button', { name: /generation/i }));

    expect(screen.getByRole('link', { name: /^posts$/i })).toBeVisible();
    expect(screen.getByRole('link', { name: /stories/i })).toBeVisible();
  });

  it('closes the previously open group when a new group header is clicked', () => {
    renderAt('/baseData');

    // "Base Data" starts open — its accordion container has grid-rows-[1fr]
    const baseDataButton = screen.getByRole('button', { name: /base data/i });
    const baseDataAccordion = baseDataButton.nextElementSibling as HTMLElement;
    expect(baseDataAccordion).toHaveClass('grid-rows-[1fr]');

    // Click "Generation" — Base Data accordion collapses
    userEvent.click(screen.getByRole('button', { name: /generation/i }));

    expect(baseDataAccordion).toHaveClass('grid-rows-[0fr]');
  });

  it('closes an open group when its own header is clicked again', () => {
    renderAt('/baseData');

    // "Base Data" is open — its accordion container has grid-rows-[1fr]
    const baseDataButton = screen.getByRole('button', { name: /base data/i });
    const baseDataAccordion = baseDataButton.nextElementSibling as HTMLElement;
    expect(baseDataAccordion).toHaveClass('grid-rows-[1fr]');

    // Click the same header to close it
    userEvent.click(baseDataButton);

    expect(baseDataAccordion).toHaveClass('grid-rows-[0fr]');
  });

  // ── NavLink hrefs ──────────────────────────────────────────────────────────

  it('renders NavLinks with the correct relative "to" paths', () => {
    // NavLink resolves relative paths against the MemoryRouter root ("/"),
    // so to="baseData" renders as href="/baseData"
    renderAt('/baseData');

    expect(screen.getByRole('link', { name: /base data/i })).toHaveAttribute('href', '/baseData');
    expect(screen.getByRole('link', { name: /products/i })).toHaveAttribute('href', '/products');
    expect(screen.getByRole('link', { name: /audiences/i })).toHaveAttribute('href', '/audiences');
  });

  it('renders "Generation" NavLinks with the correct paths', () => {
    renderAt('/posts');

    expect(screen.getByRole('link', { name: /^posts$/i })).toHaveAttribute('href', '/posts');
    expect(screen.getByRole('link', { name: /stories/i })).toHaveAttribute('href', '/stories');
  });

  // ── Active NavLink styling ─────────────────────────────────────────────────

  it('applies the active class to the NavLink matching the current route', () => {
    // NavLink to="baseData" resolves to "/baseData", so render at that path
    renderAt('/baseData');

    const activeLink = screen.getByRole('link', { name: /base data/i });
    expect(activeLink).toHaveClass('bg-blue-100');
    expect(activeLink).toHaveClass('text-blue-600');
  });

  it('does not apply the active class to NavLinks that do not match the current route', () => {
    renderAt('/baseData');

    const inactiveLink = screen.getByRole('link', { name: /products/i });
    expect(inactiveLink).not.toHaveClass('bg-blue-100');
  });

  // ── ChevronRight icon rotation ─────────────────────────────────────────────

  it('rotates the chevron icon for the open group', () => {
    renderAt('/baseData');

    // The Base Data button is open — its chevron should have rotate-90
    const openButton = screen.getByRole('button', { name: /base data/i });
    const chevron = openButton.querySelector('svg');
    expect(chevron).toHaveClass('rotate-90');
  });

  it('does not rotate the chevron icon for a closed group', () => {
    renderAt('/baseData');

    const closedButton = screen.getByRole('button', { name: /generation/i });
    const chevron = closedButton.querySelector('svg');
    expect(chevron).not.toHaveClass('rotate-90');
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { SidebarNav } from './SidebarNav';

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'BusinessSidebar.Info': 'Info',
        'BusinessSidebar.BaseData': 'Base Data',
        'BusinessSidebar.Products': 'Products',
        'BusinessSidebar.Audiences': 'Audiences',
        'BusinessSidebar.Calendar': 'Calendar',
        'BusinessSidebar.Competitors': 'Competitors',
        'BusinessSidebar.List': 'List',
        'BusinessSidebar.Dashboard': 'Dashboard',
        'BusinessSidebar.Ideas': 'Ideas',
        'BusinessSidebar.FacebookIdeas': 'Facebook Ideas',
        'BusinessSidebar.InstagramIdeas': 'Instagram Ideas',
        'BusinessSidebar.MetaAdsIdeas': 'Meta Ads Ideas',
        'BusinessSidebar.AIIdeas': 'AI Ideas',
        'BusinessSidebar.Content': 'Content',
        'BusinessSidebar.ContentPlan': 'Content Plan',
        'BusinessSidebar.Posts': 'Posts',
        'BusinessSidebar.Stories': 'Stories',
        'BusinessSidebar.Gallery': 'Gallery',
        'BusinessSidebar.Design': 'Design',
        'BusinessSidebar.AIPhoto': 'AI Photo',
      };
      return translations[key] ?? key;
    },
    i18n: { language: 'en', changeLanguage: jest.fn() },
  }),
}));

// ── Helpers ────────────────────────────────────────────────────────────────────

function renderAt(pathname: string) {
  return render(
    <MemoryRouter initialEntries={[pathname]}>
      <SidebarNav />
    </MemoryRouter>
  );
}

function getAccordion(button: HTMLElement): HTMLElement {
  return button.nextElementSibling as HTMLElement;
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('SidebarNav', () => {

  // ── Default render ─────────────────────────────────────────────────────────

  it('renders all 5 group headers', () => {
    renderAt('/dashboard');

    expect(screen.getByRole('button', { name: /^info$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^competitors$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^ideas$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^content$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^gallery$/i })).toBeInTheDocument();
  });

  it('renders the top-level Dashboard NavLink pointing to /dashboard', () => {
    renderAt('/dashboard');

    // There are two "Dashboard" links (top-level + Competitors tab), query by href
    const dashboardLinks = screen.getAllByRole('link', { name: /dashboard/i });
    const topDashboard = dashboardLinks.find((l) => l.getAttribute('href') === '/dashboard');
    expect(topDashboard).toBeInTheDocument();
  });

  // ── Groups auto-expand when their route is active (initial state) ──────────

  it('auto-expands the "Info" group when the route contains "/baseData"', () => {
    renderAt('/baseData');

    const infoButton = screen.getByRole('button', { name: /^info$/i });
    expect(getAccordion(infoButton)).toHaveClass('grid-rows-[1fr]');
  });

  it('auto-expands the "Competitors" group when the route contains "/competitors/list"', () => {
    renderAt('/competitors/list');

    const competitorsButton = screen.getByRole('button', { name: /^competitors$/i });
    expect(getAccordion(competitorsButton)).toHaveClass('grid-rows-[1fr]');
  });

  it('auto-expands the "Ideas" group when the route contains "/ideas/instagram"', () => {
    renderAt('/ideas/instagram');

    const ideasButton = screen.getByRole('button', { name: /^ideas$/i });
    expect(getAccordion(ideasButton)).toHaveClass('grid-rows-[1fr]');
  });

  it('auto-expands the "Content" group when the route contains "/posts"', () => {
    renderAt('/posts');

    const contentButton = screen.getByRole('button', { name: /^content$/i });
    expect(getAccordion(contentButton)).toHaveClass('grid-rows-[1fr]');
  });

  it('auto-expands the "Gallery" group when the route contains "/gallery"', () => {
    renderAt('/gallery');

    const galleryButton = screen.getByRole('button', { name: /^gallery$/i });
    expect(getAccordion(galleryButton)).toHaveClass('grid-rows-[1fr]');
  });

  it('does not expand any group when the route matches no tab', () => {
    renderAt('/dashboard');

    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      expect(getAccordion(button)).toHaveClass('grid-rows-[0fr]');
    });
  });

  // ── Clicking a tab within an open group keeps the group open ───────────────

  it('keeps the "Content" group open after clicking one of its NavLinks', () => {
    renderAt('/posts');

    const contentButton = screen.getByRole('button', { name: /^content$/i });
    expect(getAccordion(contentButton)).toHaveClass('grid-rows-[1fr]');

    userEvent.click(screen.getByRole('link', { name: /^stories$/i }));

    expect(getAccordion(contentButton)).toHaveClass('grid-rows-[1fr]');
  });

  it('keeps the "Info" group open after clicking one of its NavLinks', () => {
    renderAt('/baseData');

    const infoButton = screen.getByRole('button', { name: /^info$/i });
    expect(getAccordion(infoButton)).toHaveClass('grid-rows-[1fr]');

    userEvent.click(screen.getByRole('link', { name: /^products$/i }));

    expect(getAccordion(infoButton)).toHaveClass('grid-rows-[1fr]');
  });

  // ── Clicking a different group header closes the previous group ────────────

  it('closes the previously open group when a different group header is clicked', () => {
    renderAt('/posts');

    const contentButton = screen.getByRole('button', { name: /^content$/i });
    const infoButton = screen.getByRole('button', { name: /^info$/i });

    expect(getAccordion(contentButton)).toHaveClass('grid-rows-[1fr]');
    expect(getAccordion(infoButton)).toHaveClass('grid-rows-[0fr]');

    userEvent.click(infoButton);

    expect(getAccordion(contentButton)).toHaveClass('grid-rows-[0fr]');
    expect(getAccordion(infoButton)).toHaveClass('grid-rows-[1fr]');
  });

  it('opens the clicked group and closes all others', () => {
    renderAt('/dashboard');

    const infoButton = screen.getByRole('button', { name: /^info$/i });
    const ideasButton = screen.getByRole('button', { name: /^ideas$/i });

    userEvent.click(infoButton);

    expect(getAccordion(infoButton)).toHaveClass('grid-rows-[1fr]');
    expect(getAccordion(ideasButton)).toHaveClass('grid-rows-[0fr]');

    userEvent.click(ideasButton);

    expect(getAccordion(infoButton)).toHaveClass('grid-rows-[0fr]');
    expect(getAccordion(ideasButton)).toHaveClass('grid-rows-[1fr]');
  });

  // ── Clicking the same group header toggles it closed ──────────────────────

  it('closes an open group when its own header is clicked again', () => {
    renderAt('/posts');

    const contentButton = screen.getByRole('button', { name: /^content$/i });
    expect(getAccordion(contentButton)).toHaveClass('grid-rows-[1fr]');

    userEvent.click(contentButton);

    expect(getAccordion(contentButton)).toHaveClass('grid-rows-[0fr]');
  });

  it('re-opens a closed group when its header is clicked again', () => {
    renderAt('/dashboard');

    const galleryButton = screen.getByRole('button', { name: /^gallery$/i });
    expect(getAccordion(galleryButton)).toHaveClass('grid-rows-[0fr]');

    userEvent.click(galleryButton);
    expect(getAccordion(galleryButton)).toHaveClass('grid-rows-[1fr]');

    userEvent.click(galleryButton);
    expect(getAccordion(galleryButton)).toHaveClass('grid-rows-[0fr]');
  });

  // ── NavLink hrefs ──────────────────────────────────────────────────────────

  it('renders "Info" tab NavLinks with correct paths', () => {
    renderAt('/baseData');

    expect(screen.getByRole('link', { name: /^base data$/i })).toHaveAttribute('href', '/baseData');
    expect(screen.getByRole('link', { name: /^products$/i })).toHaveAttribute('href', '/products');
    expect(screen.getByRole('link', { name: /^audiences$/i })).toHaveAttribute('href', '/audiences');
    expect(screen.getByRole('link', { name: /^calendar$/i })).toHaveAttribute('href', '/calendar');
  });

  it('renders "Competitors" tab NavLinks with correct paths', () => {
    renderAt('/competitors/list');

    expect(screen.getByRole('link', { name: /^list$/i })).toHaveAttribute('href', '/competitors/list');
    // Use getAllByRole because both the top-level and Competitors tab have "Dashboard" text
    const dashboardLinks = screen.getAllByRole('link', { name: /^dashboard$/i });
    const competitorsDashboard = dashboardLinks.find(
      (l) => l.getAttribute('href') === '/competitors/dashboard'
    );
    expect(competitorsDashboard).toHaveAttribute('href', '/competitors/dashboard');
  });

  it('renders "Content" tab NavLinks with correct paths', () => {
    renderAt('/posts');

    expect(screen.getByRole('link', { name: /^content plan$/i })).toHaveAttribute('href', '/contentPlan');
    expect(screen.getByRole('link', { name: /^posts$/i })).toHaveAttribute('href', '/posts');
    expect(screen.getByRole('link', { name: /^stories$/i })).toHaveAttribute('href', '/stories');
  });

  // ── Active NavLink styling ─────────────────────────────────────────────────

  it('applies active class to the NavLink matching the current route', () => {
    renderAt('/posts');

    const activeLink = screen.getByRole('link', { name: /^posts$/i });
    expect(activeLink).toHaveClass('bg-blue-100');
    expect(activeLink).toHaveClass('text-blue-600');
  });

  it('does not apply active class to NavLinks that do not match the current route', () => {
    renderAt('/posts');

    const inactiveLink = screen.getByRole('link', { name: /^stories$/i });
    expect(inactiveLink).not.toHaveClass('bg-blue-100');
  });

  // ── ChevronRight icon rotation ─────────────────────────────────────────────

  it('rotates the chevron for the open group', () => {
    renderAt('/posts');

    // The group icon is inside <span>, the chevron is a direct child of <button>
    const contentButton = screen.getByRole('button', { name: /^content$/i });
    const chevron = contentButton.querySelector(':scope > svg');
    expect(chevron).toHaveClass('rotate-90');
  });

  it('does not rotate the chevron for closed groups', () => {
    renderAt('/posts');

    const infoButton = screen.getByRole('button', { name: /^info$/i });
    const chevron = infoButton.querySelector(':scope > svg');
    expect(chevron).not.toHaveClass('rotate-90');
  });
});

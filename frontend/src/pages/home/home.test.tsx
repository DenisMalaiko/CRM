import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from './home';

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: jest.fn() },
  }),
}));

// ── Helper ────────────────────────────────────────────────────────────────────

function renderHome() {
  return render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Home', () => {

  // ── Hero section ──────────────────────────────────────────────────────────

  it('renders hero title with NovaCRM brand', () => {
    renderHome();
    expect(screen.getByText('NovaCRM')).toBeInTheDocument();
  });

  it('renders badge text', () => {
    renderHome();
    expect(screen.getByText('Home.badge')).toBeInTheDocument();
  });

  it('renders "Start Free" CTA link pointing to /signUp', () => {
    renderHome();
    const startFreeLink = screen.getByRole('link', { name: /Home\.startFree/i });
    expect(startFreeLink).toBeInTheDocument();
    expect(startFreeLink).toHaveAttribute('href', '/signUp');
  });

  // ── Stats section ─────────────────────────────────────────────────────────

  it('renders all 4 stat items', () => {
    renderHome();
    expect(screen.getByText('Home.statModules')).toBeInTheDocument();
    expect(screen.getByText('Home.statAI')).toBeInTheDocument();
    expect(screen.getByText('Home.statAnalytics')).toBeInTheDocument();
    expect(screen.getByText('Home.statPlatforms')).toBeInTheDocument();
  });

  // ── Modules section ───────────────────────────────────────────────────────

  it('renders modules section title', () => {
    renderHome();
    expect(screen.getByText('Home.modulesTitle')).toBeInTheDocument();
  });

  it('renders all 6 module card titles', () => {
    renderHome();
    expect(screen.getByText('Home.moduleInfo')).toBeInTheDocument();
    expect(screen.getByText('Home.moduleCompetitors')).toBeInTheDocument();
    expect(screen.getByText('Home.moduleIdeas')).toBeInTheDocument();
    expect(screen.getByText('Home.moduleContent')).toBeInTheDocument();
    expect(screen.getByText('Home.moduleGallery')).toBeInTheDocument();
    expect(screen.getByText('Home.moduleAI')).toBeInTheDocument();
  });

  it('renders all 6 module card descriptions', () => {
    renderHome();
    expect(screen.getByText('Home.moduleInfoDesc')).toBeInTheDocument();
    expect(screen.getByText('Home.moduleCompetitorsDesc')).toBeInTheDocument();
    expect(screen.getByText('Home.moduleIdeasDesc')).toBeInTheDocument();
    expect(screen.getByText('Home.moduleContentDesc')).toBeInTheDocument();
    expect(screen.getByText('Home.moduleGalleryDesc')).toBeInTheDocument();
    expect(screen.getByText('Home.moduleAIDesc')).toBeInTheDocument();
  });

  // ── CTA section ───────────────────────────────────────────────────────────

  it('renders CTA section title', () => {
    renderHome();
    expect(screen.getByText('Home.ctaTitle')).toBeInTheDocument();
  });

  it('renders "Try It Free" link pointing to /signUp', () => {
    renderHome();
    const tryItFreeLink = screen.getByRole('link', { name: /Home\.tryItFree/i });
    expect(tryItFreeLink).toBeInTheDocument();
    expect(tryItFreeLink).toHaveAttribute('href', '/signUp');
  });

  // ── Footer ────────────────────────────────────────────────────────────────

  it('renders footer with copyright and NovaCRM brand', () => {
    renderHome();
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveTextContent('NovaCRM');
    expect(footer).toHaveTextContent(String(new Date().getFullYear()));
  });

  it('renders footer rights reserved text', () => {
    renderHome();
    expect(screen.getByText(/Footer\.allRightsReserved/)).toBeInTheDocument();
  });
});

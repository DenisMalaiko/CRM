import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DesignSystemCard from './DesignSystemCard';
import { TDesignSystem } from '../../../../../../../../models/DesignSystem';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeTypoLevel(fontFamily = 'Inter') {
  return {
    fontFamily,
    fontClassification: 'sans-serif',
    weight: 400,
    case: 'sentence',
    letterSpacing: '0px',
    lineHeight: 1.5,
    sizePercent: 100,
  };
}

function makeDesignSystem(overrides: Partial<TDesignSystem> = {}): TDesignSystem {
  return {
    id: 'ds-1',
    name: 'Test System',
    businessId: 'biz-1',
    source: 'MANUAL',
    isPreset: false,
    isActive: false,
    colors: {
      background: '#ffffff',
      foreground: '#000000',
      primary: '#3b82f6',
      primaryForeground: '#ffffff',
      secondary: '#6b7280',
      secondaryForeground: '#ffffff',
      muted: '#f3f4f6',
      mutedForeground: '#9ca3af',
      accent: '#8b5cf6',
      accentForeground: '#ffffff',
      destructive: '#ef4444',
      border: '#e5e7eb',
      ring: '#3b82f6',
    },
    gradients: [],
    typography: {
      headline: makeTypoLevel('Inter'),
      subheadline: makeTypoLevel('Roboto'),
      body: makeTypoLevel('Open Sans'),
      cta: makeTypoLevel('Montserrat'),
    },
    radius: '8px',
    border: { style: 'solid', width: '1px', color: '#e5e7eb' },
    shadow: { color: '#000000', blur: '4px', spread: '0px', offsetX: '0px', offsetY: '2px' },
    spacing: { baseUnit: '4px', contentPadding: '32px' },
    brandElements: { logoStyle: 'minimal', decorativeMotifs: [], graphicElements: [] },
    composition: {
      layout: 'centered',
      textPlacement: 'bottom',
      dominantPattern: 'minimal',
      negativeSpacePercent: 40,
      visualHierarchy: 'standard',
    },
    scene: {
      lighting: 'natural',
      cameraLens: 'standard',
      perspective: 'eye-level',
      depthOfField: 'moderate',
      colorTemperatureK: 5500,
      environment: 'studio',
    },
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

type RenderOptions = {
  designSystem?: TDesignSystem;
  isSelected?: boolean;
  onClick?: () => void;
  onDuplicate?: () => void;
  onSetActive?: () => void;
  onDelete?: () => void;
};

function renderCard({
  designSystem,
  isSelected = false,
  onClick = jest.fn(),
  onDuplicate,
  onSetActive,
  onDelete,
}: RenderOptions = {}) {
  const ds = designSystem ?? makeDesignSystem();
  return render(
    <DesignSystemCard
      designSystem={ds}
      isSelected={isSelected}
      onClick={onClick}
      onDuplicate={onDuplicate}
      onSetActive={onSetActive}
      onDelete={onDelete}
    />
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('DesignSystemCard', () => {
  // ── Default render ──────────────────────────────────────────────────────────

  describe('default render', () => {
    test('renders the design system name', () => {
      renderCard({ designSystem: makeDesignSystem({ name: 'My Brand' }) });
      expect(screen.getByText('My Brand')).toBeInTheDocument();
    });

    test('renders font family and radius info', () => {
      renderCard();
      expect(screen.getAllByText(/Inter/).length).toBeGreaterThan(0);
      expect(screen.getByText(/8px radius/)).toBeInTheDocument();
    });
  });

  // ── Active badge ────────────────────────────────────────────────────────────

  describe('Active badge', () => {
    test('renders "Active" badge when isActive is true', () => {
      renderCard({ designSystem: makeDesignSystem({ isActive: true }) });
      expect(screen.getByText('DesignSystem.active')).toBeInTheDocument();
    });

    test('does not render "Active" badge when isActive is false', () => {
      renderCard({ designSystem: makeDesignSystem({ isActive: false }) });
      expect(screen.queryByText('DesignSystem.active')).not.toBeInTheDocument();
    });
  });

  // ── Set Active button ────────────────────────────────────────────────────────

  describe('Set Active button', () => {
    test('renders Set Active button when onSetActive is provided and isActive is false', () => {
      renderCard({
        designSystem: makeDesignSystem({ isActive: false }),
        onSetActive: jest.fn(),
      });
      expect(screen.getByTitle('DesignSystem.setActive')).toBeInTheDocument();
    });

    test('does not render Set Active button when isActive is true', () => {
      renderCard({
        designSystem: makeDesignSystem({ isActive: true }),
        onSetActive: jest.fn(),
      });
      expect(screen.queryByTitle('DesignSystem.setActive')).not.toBeInTheDocument();
    });

    test('does not render Set Active button when onSetActive is not provided', () => {
      renderCard({
        designSystem: makeDesignSystem({ isActive: false }),
        onSetActive: undefined,
      });
      expect(screen.queryByTitle('DesignSystem.setActive')).not.toBeInTheDocument();
    });

    test('calls onSetActive when Set Active button is clicked', () => {
      const onSetActive = jest.fn();
      renderCard({
        designSystem: makeDesignSystem({ isActive: false }),
        onSetActive,
      });

      userEvent.click(screen.getByTitle('DesignSystem.setActive'));

      expect(onSetActive).toHaveBeenCalledTimes(1);
    });

    test('does not call card onClick when Set Active button is clicked (stopPropagation)', () => {
      const onClick = jest.fn();
      const onSetActive = jest.fn();
      renderCard({
        designSystem: makeDesignSystem({ isActive: false }),
        onClick,
        onSetActive,
      });

      userEvent.click(screen.getByTitle('DesignSystem.setActive'));

      expect(onSetActive).toHaveBeenCalledTimes(1);
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  // ── Preset lock icon ─────────────────────────────────────────────────────────

  describe('preset indicator', () => {
    test('renders Lock icon for preset design systems', () => {
      renderCard({ designSystem: makeDesignSystem({ isPreset: true }) });
      // Lock icon has a title attribute
      expect(screen.getByTitle('Preset template')).toBeInTheDocument();
    });

    test('does not render Lock icon for non-preset design systems', () => {
      renderCard({ designSystem: makeDesignSystem({ isPreset: false }) });
      expect(screen.queryByTitle('Preset template')).not.toBeInTheDocument();
    });
  });

  // ── Delete button ────────────────────────────────────────────────────────────

  describe('Delete button', () => {
    test('renders Delete button when onDelete is provided', () => {
      renderCard({ onDelete: jest.fn() });
      expect(screen.getByTitle('DesignSystem.delete')).toBeInTheDocument();
    });

    test('does not render Delete button when onDelete is not provided', () => {
      renderCard({ onDelete: undefined });
      expect(screen.queryByTitle('DesignSystem.delete')).not.toBeInTheDocument();
    });

    test('calls onDelete when Delete button is clicked', () => {
      const onDelete = jest.fn();
      renderCard({ onDelete });

      userEvent.click(screen.getByTitle('DesignSystem.delete'));

      expect(onDelete).toHaveBeenCalledTimes(1);
    });

    test('does not call card onClick when Delete button is clicked (stopPropagation)', () => {
      const onClick = jest.fn();
      const onDelete = jest.fn();
      renderCard({ onClick, onDelete });

      userEvent.click(screen.getByTitle('DesignSystem.delete'));

      expect(onDelete).toHaveBeenCalledTimes(1);
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  // ── onClick ─────────────────────────────────────────────────────────────────

  describe('card click', () => {
    test('calls onClick when the card is clicked', () => {
      const onClick = jest.fn();
      renderCard({ onClick });

      userEvent.click(screen.getByText('Test System'));

      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });
});

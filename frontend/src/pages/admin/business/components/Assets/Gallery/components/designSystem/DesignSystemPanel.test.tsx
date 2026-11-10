import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DesignSystemPanel from './DesignSystemPanel';
import { Fonts } from '../../../../../../../../const/Fonts';
import { TDesignSystem } from '../../../../../../../../models/DesignSystem';

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

function makeDraft(overrides: Partial<TDesignSystem> = {}): TDesignSystem {
  return {
    id: 'ds-1',
    name: 'Test System',
    businessId: 'biz-1',
    source: 'MANUAL',
    isPreset: false,
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
  activeElement?: string | null;
  draft?: TDesignSystem;
};

function renderPanel({ activeElement = 'headline', draft }: RenderOptions = {}) {
  const resolvedDraft = draft ?? makeDraft();
  const onDraftChange = jest.fn();
  const onSave = jest.fn();
  const onActiveElementChange = jest.fn();

  render(
    <DesignSystemPanel
      draft={resolvedDraft}
      original={resolvedDraft}
      activeElement={activeElement}
      onActiveElementChange={onActiveElementChange}
      onDraftChange={onDraftChange}
      onSave={onSave}
    />
  );

  return { onDraftChange, onSave, onActiveElementChange };
}

/**
 * Returns the <select> element that immediately follows the "Family" label text.
 * The component renders label + select inside the same flex container but without
 * a htmlFor/id association, so we locate the row by label text then find the select.
 */
function getFamilySelect(): HTMLSelectElement {
  const label = screen.getByText('Family');
  const row = label.closest('div') as HTMLElement;
  return within(row).getByRole('combobox') as HTMLSelectElement;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('DesignSystemPanel', () => {

  // ── Font family renders as <select>, not <input type="text"> ────────────────

  describe('FontFamilySelect — headline tab', () => {
    test('renders a combobox in the Family row, not a text input', () => {
      renderPanel({ activeElement: 'headline' });

      const select = getFamilySelect();
      expect(select.tagName).toBe('SELECT');
    });

    test('no text input exists in the Family row', () => {
      renderPanel({ activeElement: 'headline' });

      const label = screen.getByText('Family');
      const row = label.closest('div') as HTMLElement;
      expect(within(row).queryByRole('textbox')).not.toBeInTheDocument();
    });

    test('select contains all 39 fonts from the Fonts array', () => {
      renderPanel({ activeElement: 'headline' });

      const select = getFamilySelect();
      const optionValues = Array.from(select.options).map((o) => o.value);

      Fonts.forEach((font) => {
        expect(optionValues).toContain(font);
      });
    });

    test('select has exactly 37 options when the current font is in the list', () => {
      renderPanel({ activeElement: 'headline' });

      const select = getFamilySelect();
      expect(select.options).toHaveLength(39);
    });

    test('select shows the current font family as selected value', () => {
      renderPanel({ activeElement: 'headline' });

      expect(getFamilySelect().value).toBe('Inter');
    });

    test('calls onDraftChange with updated fontFamily when a different font is selected', () => {
      const { onDraftChange } = renderPanel({ activeElement: 'headline' });

      userEvent.selectOptions(getFamilySelect(), 'Roboto');

      expect(onDraftChange).toHaveBeenCalledTimes(1);
      const updatedDraft: TDesignSystem = onDraftChange.mock.calls[0][0];
      expect(updatedDraft.typography.headline.fontFamily).toBe('Roboto');
    });
  });

  // ── Custom font value not in Fonts list ─────────────────────────────────────

  describe('FontFamilySelect — custom (non-list) font', () => {
    test('prepends the custom font as an option with "(custom)" label', () => {
      const draft = makeDraft();
      draft.typography.headline.fontFamily = 'MyCustomFont';

      renderPanel({ activeElement: 'headline', draft });

      expect(screen.getByRole('option', { name: 'MyCustomFont (custom)' })).toBeInTheDocument();
    });

    test('custom font option is selected when the value is not in Fonts', () => {
      const draft = makeDraft();
      draft.typography.headline.fontFamily = 'MyCustomFont';

      renderPanel({ activeElement: 'headline', draft });

      expect(getFamilySelect().value).toBe('MyCustomFont');
    });

    test('select has 40 options when the current font is not in the list', () => {
      const draft = makeDraft();
      draft.typography.headline.fontFamily = 'MyCustomFont';

      renderPanel({ activeElement: 'headline', draft });

      expect(getFamilySelect().options).toHaveLength(40);
    });

    test('all standard fonts are still present alongside the custom font', () => {
      const draft = makeDraft();
      draft.typography.headline.fontFamily = 'MyCustomFont';

      renderPanel({ activeElement: 'headline', draft });

      const optionValues = Array.from(getFamilySelect().options).map((o) => o.value);
      Fonts.forEach((font) => {
        expect(optionValues).toContain(font);
      });
    });

    test('known fonts do not receive the "(custom)" suffix', () => {
      renderPanel({ activeElement: 'headline' });

      const interOption = screen.getByRole('option', { name: 'Inter' });
      expect(interOption.textContent).toBe('Inter');
    });
  });

  // ── FontFamilySelect appears on every typography tab ────────────────────────

  describe('FontFamilySelect — other typography tabs', () => {
    test.each(['subheadline', 'description', 'button'] as const)(
      'renders a Family label with a combobox on the "%s" tab',
      (tab) => {
        renderPanel({ activeElement: tab });

        const label = screen.getByText('Family');
        const row = label.closest('div') as HTMLElement;
        expect(within(row).getByRole('combobox')).toBeInTheDocument();
      }
    );
  });

  // ── Canvas tab (default) has no font family select ─────────────────────────

  describe('canvas tab', () => {
    test('does not render a Family label on the canvas tab', () => {
      renderPanel({ activeElement: null });

      expect(screen.queryByText('Family')).not.toBeInTheDocument();
    });
  });

  // ── Tab navigation ──────────────────────────────────────────────────────────

  describe('tab navigation', () => {
    test('calls onActiveElementChange with "headline" when the Headline tab is clicked', () => {
      const { onActiveElementChange } = renderPanel({ activeElement: null });

      userEvent.click(screen.getByRole('button', { name: /headline/i }));

      expect(onActiveElementChange).toHaveBeenCalledWith('headline');
    });

    test('calls onActiveElementChange with null when the Canvas tab is clicked', () => {
      const { onActiveElementChange } = renderPanel({ activeElement: 'headline' });

      userEvent.click(screen.getByRole('button', { name: /canvas/i }));

      expect(onActiveElementChange).toHaveBeenCalledWith(null);
    });
  });

  // ── Save button ─────────────────────────────────────────────────────────────

  describe('save button', () => {
    test('save button is disabled when draft equals original', () => {
      renderPanel({ activeElement: null });

      expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
    });

    test('save button is enabled when draft differs from original', () => {
      const original = makeDraft();
      const modified = { ...original, name: 'Changed Name' };

      render(
        <DesignSystemPanel
          draft={modified}
          original={original}
          activeElement={null}
          onActiveElementChange={jest.fn()}
          onDraftChange={jest.fn()}
          onSave={jest.fn()}
        />
      );

      expect(screen.getByRole('button', { name: /save/i })).not.toBeDisabled();
    });
  });

  // ── Preset hides save / delete ───────────────────────────────────────────────

  describe('preset design system', () => {
    test('does not render Save or Delete buttons for a preset', () => {
      const draft = makeDraft({ isPreset: true });

      render(
        <DesignSystemPanel
          draft={draft}
          original={draft}
          activeElement={null}
          onActiveElementChange={jest.fn()}
          onDraftChange={jest.fn()}
          onSave={jest.fn()}
        />
      );

      expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
    });
  });
});

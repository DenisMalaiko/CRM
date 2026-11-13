import reducer, {
  setActiveSystem,
  setBusinessSystems,
  setSelected,
} from './designSystemSlice';
import { TDesignSystem } from '../../models/DesignSystem';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeSystem(overrides: Partial<TDesignSystem> = {}): TDesignSystem {
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
      headline: { fontFamily: 'Inter', fontClassification: 'sans-serif', weight: 400, case: 'sentence', letterSpacing: '0px', lineHeight: 1.5, sizePercent: 100 },
      subheadline: { fontFamily: 'Inter', fontClassification: 'sans-serif', weight: 400, case: 'sentence', letterSpacing: '0px', lineHeight: 1.5, sizePercent: 100 },
      body: { fontFamily: 'Inter', fontClassification: 'sans-serif', weight: 400, case: 'sentence', letterSpacing: '0px', lineHeight: 1.5, sizePercent: 100 },
      cta: { fontFamily: 'Inter', fontClassification: 'sans-serif', weight: 400, case: 'sentence', letterSpacing: '0px', lineHeight: 1.5, sizePercent: 100 },
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

const initialState = {
  presets: [],
  businessSystems: [],
  selected: null,
  panelOpen: false,
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('designSystemSlice — setActiveSystem', () => {
  test('deactivates all systems and activates only the target', () => {
    const systems = [
      makeSystem({ id: 'ds-1', isActive: true }),
      makeSystem({ id: 'ds-2', isActive: false }),
      makeSystem({ id: 'ds-3', isActive: false }),
    ];

    const state = reducer(
      { ...initialState, businessSystems: systems },
      setActiveSystem('ds-2')
    );

    expect(state.businessSystems.find((s) => s.id === 'ds-1')!.isActive).toBe(false);
    expect(state.businessSystems.find((s) => s.id === 'ds-2')!.isActive).toBe(true);
    expect(state.businessSystems.find((s) => s.id === 'ds-3')!.isActive).toBe(false);
  });

  test('when selected matches target, sets selected.isActive to true', () => {
    const target = makeSystem({ id: 'ds-1', isActive: false });
    const state = reducer(
      { ...initialState, businessSystems: [target], selected: target, panelOpen: true },
      setActiveSystem('ds-1')
    );

    expect(state.selected!.isActive).toBe(true);
  });

  test('when selected does not match target, sets selected.isActive to false', () => {
    const selected = makeSystem({ id: 'ds-99', isActive: true });
    const other = makeSystem({ id: 'ds-2', isActive: false });
    const state = reducer(
      { ...initialState, businessSystems: [selected, other], selected, panelOpen: true },
      setActiveSystem('ds-2')
    );

    expect(state.selected!.isActive).toBe(false);
  });

  test('with unknown id — no system is activated and nothing throws', () => {
    const systems = [
      makeSystem({ id: 'ds-1', isActive: true }),
      makeSystem({ id: 'ds-2', isActive: false }),
    ];

    const state = reducer(
      { ...initialState, businessSystems: systems },
      setActiveSystem('nonexistent-id')
    );

    expect(state.businessSystems.every((s) => !s.isActive)).toBe(true);
  });

  test('with unknown id and selected set — selected.isActive becomes false', () => {
    const selected = makeSystem({ id: 'ds-1', isActive: true });
    const state = reducer(
      { ...initialState, businessSystems: [selected], selected, panelOpen: true },
      setActiveSystem('nonexistent-id')
    );

    expect(state.selected!.isActive).toBe(false);
  });

  test('when selected is null — does not throw and businessSystems are still updated', () => {
    const systems = [
      makeSystem({ id: 'ds-1', isActive: false }),
    ];

    const state = reducer(
      { ...initialState, businessSystems: systems, selected: null },
      setActiveSystem('ds-1')
    );

    expect(state.businessSystems[0].isActive).toBe(true);
    expect(state.selected).toBeNull();
  });

  test('only one system is active after multiple setActiveSystem calls', () => {
    const systems = [
      makeSystem({ id: 'ds-1', isActive: false }),
      makeSystem({ id: 'ds-2', isActive: false }),
      makeSystem({ id: 'ds-3', isActive: false }),
    ];

    let state = reducer(
      { ...initialState, businessSystems: systems },
      setActiveSystem('ds-1')
    );
    state = reducer(state, setActiveSystem('ds-3'));

    const activeSystems = state.businessSystems.filter((s) => s.isActive);
    expect(activeSystems).toHaveLength(1);
    expect(activeSystems[0].id).toBe('ds-3');
  });
});

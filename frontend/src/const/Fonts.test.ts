import { Fonts, GOOGLE_FONTS, SYSTEM_FONTS, GENERIC_FONTS } from './Fonts';

describe('GOOGLE_FONTS', () => {
  test('exports an array of 22 items', () => {
    expect(GOOGLE_FONTS).toHaveLength(22);
  });

  test('every item is a non-empty string', () => {
    GOOGLE_FONTS.forEach((font) => {
      expect(typeof font).toBe('string');
      expect(font.length).toBeGreaterThan(0);
    });
  });

  test('contains no duplicates', () => {
    expect(new Set(GOOGLE_FONTS).size).toBe(GOOGLE_FONTS.length);
  });

  test('includes expected web fonts', () => {
    expect(GOOGLE_FONTS).toContain('Inter');
    expect(GOOGLE_FONTS).toContain('Roboto');
    expect(GOOGLE_FONTS).toContain('Montserrat');
    expect(GOOGLE_FONTS).toContain('Playfair Display');
  });

  test('does not include system or generic fonts', () => {
    expect(GOOGLE_FONTS).not.toContain('Arial');
    expect(GOOGLE_FONTS).not.toContain('sans-serif');
  });
});

describe('SYSTEM_FONTS', () => {
  test('exports an array of 12 items', () => {
    expect(SYSTEM_FONTS).toHaveLength(12);
  });

  test('every item is a non-empty string', () => {
    SYSTEM_FONTS.forEach((font) => {
      expect(typeof font).toBe('string');
      expect(font.length).toBeGreaterThan(0);
    });
  });

  test('contains no duplicates', () => {
    expect(new Set(SYSTEM_FONTS).size).toBe(SYSTEM_FONTS.length);
  });

  test('includes expected system fonts', () => {
    expect(SYSTEM_FONTS).toContain('Arial');
    expect(SYSTEM_FONTS).toContain('Georgia');
    expect(SYSTEM_FONTS).toContain('Times New Roman');
  });

  test('does not include Google or generic fonts', () => {
    expect(SYSTEM_FONTS).not.toContain('Inter');
    expect(SYSTEM_FONTS).not.toContain('sans-serif');
  });
});

describe('GENERIC_FONTS', () => {
  test('exports an array of 5 items', () => {
    expect(GENERIC_FONTS).toHaveLength(5);
  });

  test('every item is a non-empty string', () => {
    GENERIC_FONTS.forEach((font) => {
      expect(typeof font).toBe('string');
      expect(font.length).toBeGreaterThan(0);
    });
  });

  test('contains no duplicates', () => {
    expect(new Set(GENERIC_FONTS).size).toBe(GENERIC_FONTS.length);
  });

  test('includes expected generic font keywords', () => {
    expect(GENERIC_FONTS).toContain('sans-serif');
    expect(GENERIC_FONTS).toContain('serif');
    expect(GENERIC_FONTS).toContain('monospace');
    expect(GENERIC_FONTS).toContain('system-ui');
  });
});

describe('Fonts', () => {
  test('exports an array', () => {
    expect(Array.isArray(Fonts)).toBe(true);
  });

  test('contains exactly 39 items', () => {
    expect(Fonts).toHaveLength(39);
  });

  test('is a spread of all three sub-arrays', () => {
    expect(Fonts).toHaveLength(
      GOOGLE_FONTS.length + SYSTEM_FONTS.length + GENERIC_FONTS.length
    );
  });

  test('every item is a non-empty string', () => {
    Fonts.forEach((font) => {
      expect(typeof font).toBe('string');
      expect(font.length).toBeGreaterThan(0);
    });
  });

  test('contains no duplicates', () => {
    const unique = new Set(Fonts);
    expect(unique.size).toBe(Fonts.length);
  });

  test('includes common system fonts', () => {
    expect(Fonts).toContain('Arial');
    expect(Fonts).toContain('Georgia');
    expect(Fonts).toContain('system-ui');
  });

  test('includes common Google Fonts', () => {
    expect(Fonts).toContain('Inter');
    expect(Fonts).toContain('Roboto');
    expect(Fonts).toContain('Montserrat');
  });

  test('preserves order: Google Fonts first, then system, then generic', () => {
    const firstGoogle = Fonts.indexOf(GOOGLE_FONTS[0]);
    const firstSystem = Fonts.indexOf(SYSTEM_FONTS[0]);
    const firstGeneric = Fonts.indexOf(GENERIC_FONTS[0]);

    expect(firstGoogle).toBeLessThan(firstSystem);
    expect(firstSystem).toBeLessThan(firstGeneric);
  });
});

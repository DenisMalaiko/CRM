import { getDescriptionText, setDescriptionText } from './photoDescription';

describe('getDescriptionText', () => {
  test('returns the value for the requested language when it exists', () => {
    expect(getDescriptionText({ en: 'hello', uk: 'привіт' }, 'uk')).toBe('привіт');
  });

  test('falls back to "en" when the requested language key is missing', () => {
    expect(getDescriptionText({ en: 'hello' }, 'uk')).toBe('hello');
  });

  test('returns empty string when both requested language and "en" fallback are missing', () => {
    expect(getDescriptionText({ fr: 'bonjour' }, 'uk')).toBe('');
  });

  test('returns empty string for an empty object', () => {
    expect(getDescriptionText({}, 'en')).toBe('');
  });

  test('returns empty string when description is null', () => {
    expect(getDescriptionText(null, 'en')).toBe('');
  });

  test('returns empty string when description is undefined', () => {
    expect(getDescriptionText(undefined, 'en')).toBe('');
  });

  test('returns exact match even when en key also exists', () => {
    expect(getDescriptionText({ en: 'english', uk: 'ukrainian' }, 'en')).toBe('english');
  });
});

describe('setDescriptionText', () => {
  test('creates a new record with the given language key when description is null', () => {
    expect(setDescriptionText(null, 'en', 'hello')).toEqual({ en: 'hello' });
  });

  test('creates a new record with the given language key when description is undefined', () => {
    expect(setDescriptionText(undefined, 'uk', 'привіт')).toEqual({ uk: 'привіт' });
  });

  test('adds a new language key to an existing record without mutating it', () => {
    const original = { en: 'hello' };
    const result = setDescriptionText(original, 'uk', 'привіт');
    expect(result).toEqual({ en: 'hello', uk: 'привіт' });
    expect(original).toEqual({ en: 'hello' });
  });

  test('updates the value of an existing language key', () => {
    const result = setDescriptionText({ en: 'old value' }, 'en', 'new value');
    expect(result).toEqual({ en: 'new value' });
  });

  test('preserves all existing keys when adding a new one', () => {
    const result = setDescriptionText({ en: 'hello', fr: 'bonjour' }, 'uk', 'привіт');
    expect(result).toEqual({ en: 'hello', fr: 'bonjour', uk: 'привіт' });
  });

  test('returns a new object reference, never the same object', () => {
    const original = { en: 'hello' };
    const result = setDescriptionText(original, 'en', 'hello');
    expect(result).not.toBe(original);
  });
});

import { getMarketingDatesForYear } from './MarketingDates';

describe('getMarketingDatesForYear', () => {
  const result2026 = getMarketingDatesForYear(2026);

  it('returns exactly 6 items', () => {
    expect(result2026).toHaveLength(6);
  });

  it('all items have primaryType "marketing"', () => {
    result2026.forEach((item) => {
      expect(item.primaryType).toBe('marketing');
    });
  });

  it('all items have type ["marketing"]', () => {
    result2026.forEach((item) => {
      expect(item.type).toEqual(['marketing']);
    });
  });

  describe('fixed dates', () => {
    it.each([
      ["Valentine's Day", '02-14'],
      ["International Women's Day", '03-08'],
      ["Earth Day", '04-22'],
      ["Halloween", '10-31'],
      ["Singles' Day", '11-11'],
    ])('%s is on %s every year', (name, monthDay) => {
      [2024, 2025, 2026, 2027].forEach((year) => {
        const dates = getMarketingDatesForYear(year);
        const match = dates.find((d) => d.name === name);
        expect(match).toBeDefined();
        expect(match!.date).toBe(`${year}-${monthDay}`);
      });
    });
  });

  describe('Black Friday', () => {
    it.each([
      [2024, '2024-11-29'],
      [2025, '2025-11-28'],
      [2026, '2026-11-27'],
      [2027, '2027-11-26'],
    ])('in %i falls on %s', (year, expected) => {
      const dates = getMarketingDatesForYear(year);
      const bf = dates.find((d) => d.name === 'Black Friday');
      expect(bf).toBeDefined();
      expect(bf!.date).toBe(expected);
    });

    it('always falls on a Friday (getDay === 5)', () => {
      [2024, 2025, 2026, 2027, 2028].forEach((year) => {
        const dates = getMarketingDatesForYear(year);
        const bf = dates.find((d) => d.name === 'Black Friday');
        const day = new Date(bf!.date + 'T12:00:00').getDay();
        expect(day).toBe(5);
      });
    });
  });
});

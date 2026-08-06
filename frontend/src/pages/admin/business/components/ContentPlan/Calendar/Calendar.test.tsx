import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { format, addMonths, subMonths } from 'date-fns';
import { Calendar } from './Calendar';

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockUseAppSelector = jest.fn<any, any[]>(() => undefined);

jest.mock('../../../../../../store/hooks', () => ({
  useAppSelector: (...args: any[]) => mockUseAppSelector(...args),
  useAppDispatch: () => jest.fn(),
}));

const mockUseGetHolidaysQuery = jest.fn();

jest.mock('../../../../../../store/holidays/holidaysApi', () => ({
  useGetHolidaysQuery: (...args: any[]) => mockUseGetHolidaysQuery(...args),
}));

const mockGetBusiness = jest.fn(() => ({ unwrap: () => Promise.resolve({ data: null }) }));

jest.mock('../../../../../../store/businesses/businessesApi', () => ({
  useGetBusinessMutation: () => [mockGetBusiness],
}));

jest.mock('../../../../../../store/businesses/businessesSlice', () => ({
  setBusiness: (data: any) => ({ type: 'business/setBusiness', payload: data }),
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

function renderComponent() {
  return render(
    <MemoryRouter>
      <Calendar />
    </MemoryRouter>
  );
}

/** Returns a holiday fixture for today's date (always in the current month). */
function todayHoliday(localName = 'Test Holiday') {
  return { date: format(new Date(), 'yyyy-MM-dd'), localName, name: localName, countryCode: 'UA' };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Calendar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAppSelector.mockReturnValue(undefined);
    mockUseGetHolidaysQuery.mockReturnValue({ data: undefined });
  });

  // ── Default render ─────────────────────────────────────────────────────────

  it('renders without crashing', () => {
    renderComponent();
    expect(screen.getByRole('heading', { name: /calendar/i })).toBeInTheDocument();
  });

  // ── Header ─────────────────────────────────────────────────────────────────

  it('shows the current month and year in the header', () => {
    renderComponent();
    const expected = format(new Date(), 'MMMM yyyy');
    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  // ── Weekday headers ────────────────────────────────────────────────────────

  it('shows all weekday headers Mon through Sun', () => {
    renderComponent();
    const headers = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    headers.forEach(day => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });

  // ── Month navigation ───────────────────────────────────────────────────────

  it('navigates to the previous month when "Previous month" is clicked', () => {
    renderComponent();
    const prevMonth = format(subMonths(new Date(), 1), 'MMMM yyyy');

    fireEvent.click(screen.getByRole('button', { name: /previous month/i }));

    expect(screen.getByText(prevMonth)).toBeInTheDocument();
  });

  it('navigates to the next month when "Next month" is clicked', () => {
    renderComponent();
    const nextMonth = format(addMonths(new Date(), 1), 'MMMM yyyy');

    fireEvent.click(screen.getByRole('button', { name: /next month/i }));

    expect(screen.getByText(nextMonth)).toBeInTheDocument();
  });

  it('navigating forward and then back returns to the current month', () => {
    renderComponent();
    const currentMonthLabel = format(new Date(), 'MMMM yyyy');

    fireEvent.click(screen.getByRole('button', { name: /next month/i }));
    fireEvent.click(screen.getByRole('button', { name: /previous month/i }));

    expect(screen.getByText(currentMonthLabel)).toBeInTheDocument();
  });

  // ── Today button ───────────────────────────────────────────────────────────

  it('resets to the current month when "Today" is clicked after navigation', () => {
    renderComponent();
    const currentMonthLabel = format(new Date(), 'MMMM yyyy');

    fireEvent.click(screen.getByRole('button', { name: /next month/i }));
    fireEvent.click(screen.getByRole('button', { name: /next month/i }));

    fireEvent.click(screen.getByRole('button', { name: /today/i }));

    expect(screen.getByText(currentMonthLabel)).toBeInTheDocument();
  });

  // ── Today highlight ────────────────────────────────────────────────────────

  it("applies the today highlight class to today's date cell", () => {
    renderComponent();
    const todayNumber = format(new Date(), 'd');

    // Find the span that displays today's date number and has the highlight class
    const todaySpan = screen
      .getAllByText(todayNumber)
      .find(el => el.classList.contains('bg-blue-100'));

    expect(todaySpan).toBeInTheDocument();
  });

  // ── Holiday display ────────────────────────────────────────────────────────

  it('renders without crashing when no country is set', () => {
    renderComponent();
    expect(screen.getByRole('heading', { name: /calendar/i })).toBeInTheDocument();
  });

  it('renders holiday name on a day cell when holidays API returns data', () => {
    mockUseGetHolidaysQuery.mockReturnValue({
      data: { data: [todayHoliday()] },
    });

    renderComponent();

    expect(screen.getByText('Test Holiday')).toBeInTheDocument();
  });

  // ── Holiday styling ────────────────────────────────────────────────────────

  it('applies bg-red-50 to the day cell that has a holiday', () => {
    mockUseGetHolidaysQuery.mockReturnValue({
      data: { data: [todayHoliday('Independence Day')] },
    });

    renderComponent();

    // Walk from label → badge wrapper → day cell
    const label = screen.getByText('Independence Day');
    const dayCell = label.parentElement!.parentElement!;
    expect(dayCell.className).toContain('bg-red-50');
  });

  it('applies bg-red-100 badge with rounded corners to holiday label', () => {
    mockUseGetHolidaysQuery.mockReturnValue({
      data: { data: [todayHoliday('Labour Day')] },
    });

    renderComponent();

    const label = screen.getByText('Labour Day');
    const badge = label.parentElement!;
    expect(badge.className).toContain('bg-red-100');
    expect(badge.className).toContain('rounded');
  });

  it('displays the localName field (not the name field) on the day cell', () => {
    mockUseGetHolidaysQuery.mockReturnValue({
      data: {
        data: [
          {
            date: format(new Date(), 'yyyy-MM-dd'),
            localName: 'День незалежності',
            name: 'Independence Day',
            countryCode: 'UA',
          },
        ],
      },
    });

    renderComponent();

    expect(screen.getByText('День незалежності')).toBeInTheDocument();
    expect(screen.queryByText('Independence Day')).not.toBeInTheDocument();
  });

  // ── No country — API skipped ───────────────────────────────────────────────

  it('does not display any holiday when business has no country set', () => {
    // useAppSelector returns undefined → country is undefined → skip: true
    mockUseAppSelector.mockReturnValue(undefined);
    // Even if the hook were called it returns nothing
    mockUseGetHolidaysQuery.mockReturnValue({ data: undefined });

    renderComponent();

    // The API should have been called with skip: true (verified via absence of holiday UI)
    expect(screen.queryByText('Test Holiday')).not.toBeInTheDocument();
  });

  it('skips the holidays API call when country is not set', () => {
    mockUseAppSelector.mockReturnValue(undefined);

    renderComponent();

    // Second argument to useGetHolidaysQuery must include { skip: true }
    const [, options] = mockUseGetHolidaysQuery.mock.calls[0];
    expect(options).toMatchObject({ skip: true });
  });

  it('does not apply bg-red-50 to any cell when holidays data is absent', () => {
    mockUseGetHolidaysQuery.mockReturnValue({ data: undefined });

    const { container } = renderComponent();

    expect(container.querySelector('.bg-red-50')).toBeNull();
  });

  // ── Country present — API called ───────────────────────────────────────────

  it('calls the holidays API with skip: false when a country is set', () => {
    mockUseAppSelector.mockImplementation((selector: any) =>
      selector({ businessModule: { business: { country: 'UA' } } })
    );

    renderComponent();

    const [, options] = mockUseGetHolidaysQuery.mock.calls[0];
    expect(options).toMatchObject({ skip: false });
  });
});

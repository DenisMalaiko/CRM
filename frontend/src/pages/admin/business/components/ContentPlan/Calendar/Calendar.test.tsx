import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { format, addMonths, subMonths } from 'date-fns';
import Calendar from './Calendar';

// ── Helpers ───────────────────────────────────────────────────────────────────

function renderComponent() {
  return render(
    <MemoryRouter>
      <Calendar />
    </MemoryRouter>
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Calendar', () => {
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
});

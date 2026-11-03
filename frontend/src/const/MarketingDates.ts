import { addDays, getDay, format } from "date-fns";
import { TCalendarificHoliday } from "../models/CalendarificHoliday";

function getBlackFridayDate(year: number): string {
  let thursdayCount = 0;

  for (let d = 1; d <= 30; d++) {
    const date = new Date(year, 10, d);
    if (getDay(date) === 4) {
      thursdayCount++;
      if (thursdayCount === 4) {
        return format(addDays(date, 1), "yyyy-MM-dd");
      }
    }
  }

  return format(new Date(year, 10, 28), "yyyy-MM-dd");
}

export function getMarketingDatesForYear(year: number): TCalendarificHoliday[] {
  return [
    {
      name: "Valentine's Day",
      nameKey: "CalendarPage.holidays.valentinesDay",
      description: "Global celebration of love and romance",
      date: format(new Date(year, 1, 14), "yyyy-MM-dd"),
      type: ["marketing"],
      primaryType: "marketing",
    },
    {
      name: "International Women's Day",
      nameKey: "CalendarPage.holidays.internationalWomensDay",
      description: "Global day celebrating women's achievements",
      date: format(new Date(year, 2, 8), "yyyy-MM-dd"),
      type: ["marketing"],
      primaryType: "marketing",
    },
    {
      name: "Earth Day",
      nameKey: "CalendarPage.holidays.earthDay",
      description: "Annual event for environmental protection",
      date: format(new Date(year, 3, 22), "yyyy-MM-dd"),
      type: ["marketing"],
      primaryType: "marketing",
    },
    {
      name: "Halloween",
      nameKey: "CalendarPage.holidays.halloween",
      description: "Annual celebration on October 31st",
      date: format(new Date(year, 9, 31), "yyyy-MM-dd"),
      type: ["marketing"],
      primaryType: "marketing",
    },
    {
      name: "Singles' Day",
      nameKey: "CalendarPage.holidays.singlesDay",
      description: "World's largest online shopping event (11.11)",
      date: format(new Date(year, 10, 11), "yyyy-MM-dd"),
      type: ["marketing"],
      primaryType: "marketing",
    },
    {
      name: "Black Friday",
      nameKey: "CalendarPage.holidays.blackFriday",
      description: "Major shopping day after Thanksgiving",
      date: getBlackFridayDate(year),
      type: ["marketing"],
      primaryType: "marketing",
    },
  ];
}

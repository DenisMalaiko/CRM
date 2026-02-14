import moment from "moment";

export const toDate = (date: Date | string | undefined) => {
  if(!date) return '-';
  return moment(date).format("DD-MM-YYYY / HH:mm");
}

export function toStartOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}
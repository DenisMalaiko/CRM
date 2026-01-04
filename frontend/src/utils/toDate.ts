import moment from "moment";

export const toDate = (date: Date | string | undefined) => {
  if(!date) return '-';
  return moment(date).format("DD-MM-YYYY / HH:mm");
}
import moment from "moment";

export const toDate = (date: string | undefined) => {
  if(!date) return '-';
  return moment(date).format("DD-MM-YYYY / HH:mm");
}
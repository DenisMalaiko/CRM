export const splitCamelCase = (text: string) => {
  return text.split(/(?=[A-Z])/).join(" ");
}
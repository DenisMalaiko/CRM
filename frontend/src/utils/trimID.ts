export const trimID = (value: string | undefined): string => {
  if(!value) return '';

  if (value.length <= 6) return value;

  const start: string = value.slice(0, 3);
  const end: string = value.slice(-3);

  return `${start}...${end}`;
}
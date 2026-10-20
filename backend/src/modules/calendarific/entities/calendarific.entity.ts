export type TTranslations = {
  en: string;
  uk: string;
};

export type TCalendarificHolidayCached = {
  date: string;
  type: string[];
  primaryType: string;
  names: TTranslations;
  descriptions: TTranslations;
};

export type TCalendarificHoliday = {
  name: string;
  description: string;
  date: string;
  type: string[];
  primaryType: string;
};

import { z } from 'zod';

const translationsSchema = z.object({
  en: z.string(),
  uk: z.string(),
});

export const holidayTranslationSchema = z.array(
  z.object({
    name: translationsSchema,
    description: translationsSchema,
  }),
);

export type THolidayTranslation = z.infer<typeof holidayTranslationSchema>;

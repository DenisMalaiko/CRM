import { Prisma } from '@prisma/client';

export function getPhotoDescriptionText(
  description: Prisma.JsonValue | null | undefined,
  lang: string = 'en',
): string {
  if (!description || typeof description !== 'object' || Array.isArray(description)) {
    return '';
  }
  const dict = description as Record<string, string>;
  return dict[lang] ?? dict['en'] ?? Object.values(dict)[0] ?? '';
}
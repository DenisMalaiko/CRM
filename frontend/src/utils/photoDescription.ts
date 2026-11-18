import { TPhotoDescription } from '../models/Gallery';

export function getDescriptionText(
  description: TPhotoDescription | null | undefined,
  lang: string,
): string {
  if (!description) return '';
  return description[lang] ?? description['en'] ?? '';
}

export function setDescriptionText(
  description: TPhotoDescription | null | undefined,
  lang: string,
  text: string,
): TPhotoDescription {
  return { ...(description ?? {}), [lang]: text };
}

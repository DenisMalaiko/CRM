export type ContentPlanPostFormat = "POST" | "REELS" | "STORIES";

export type FormatDimensions = {
  width: number;
  height: number;
  aspectRatio: string;
};

export const CONTENT_FORMAT_DIMENSIONS: Record<ContentPlanPostFormat, FormatDimensions> = {
  POST: { width: 1080, height: 1080, aspectRatio: "1/1" },
  REELS: { width: 1080, height: 1920, aspectRatio: "9/16" },
  STORIES: { width: 1080, height: 1920, aspectRatio: "9/16" },
};

export function getFormatDimensions(format: string): FormatDimensions {
  return CONTENT_FORMAT_DIMENSIONS[format as ContentPlanPostFormat] ?? CONTENT_FORMAT_DIMENSIONS.POST;
}

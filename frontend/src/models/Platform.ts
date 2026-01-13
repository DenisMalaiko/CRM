import { Platforms } from "../enum/Platforms";

export type TPlatform = {
  id: string;
  businessId: string;
  code: Platforms;
  name: string;
  trendRefreshRate?: number;
  supportedFormats?: string[];
  isActive: boolean;
};

export type TPlatformCreate = Omit<TPlatform, "id">
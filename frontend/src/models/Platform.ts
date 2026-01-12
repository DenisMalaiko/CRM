export type TPlatform = {
  id: string;
  businessId: string;
  code: string;
  name: string;
  trendRefreshRate: number;
  supportedFormats: string[];
  isActive: boolean;
};

export type TPlatformCreate = Omit<TPlatform, "id">
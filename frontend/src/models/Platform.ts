export type TPlatformCreate = {
  code: string;
  name: string;
  trendRefreshRate: number;
  supportedFormats: string[];
  isActive: boolean;
};

export type TPlatform = TPlatformCreate & {
  id: string;
  businessId: string;
};
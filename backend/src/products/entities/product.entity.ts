import { ProductType, PriceSegment } from "@prisma/client"

export type TProduct = {
  id: string;
  businessId: string;
  type: ProductType;
  priceSegment: PriceSegment;
  name: string;
  description: string;
  isActive: boolean;
  images: string[];
};

export type TProductCreate = Omit<TProduct, 'id'>;
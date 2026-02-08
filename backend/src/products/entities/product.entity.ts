import { ProductType, PriceSegment } from "@prisma/client"

type TProductBase = {
  businessId: string;
  type: ProductType;
  priceSegment: PriceSegment;
  name: string;
  description: string;
  isActive: boolean;
  images: string[];
}

export type TProduct = TProductBase & {
  id: string;
};

export type TProductCreate = TProductBase;

export type TProductUpdate = TProductBase;
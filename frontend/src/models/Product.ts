import { ProductType } from "../enum/ProductType";
import { PriceSegment } from "../enum/PriceSegment";

export type TProductCreate = {
  businessId: string;
  name: string;
  description: string;
  type: ProductType;
  priceSegment: PriceSegment;
  isActive: boolean;
};

export type TProduct = TProductCreate & {
  id: string;
  images?: string[];
}

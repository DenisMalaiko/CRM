import { TBaseModel } from "./BaseModel";
import { ProductStatus } from "../enum/ProductStatus";
import { Categories } from "../enum/Categories";

export type TImage = {
  url: string;
  thumbUrl: string;
}

export type TProduct = TBaseModel & {
  name: string;
  description: string;
  sku: string;
  price: number;
  category: Categories;
  status: ProductStatus;
  images?: TImage[];
  createdAt?: string;
  updatedAt?: string;
};
import { TBaseModel } from "./BaseModel";
import { ProductStatus } from "../enum/ProductStatus";
import { Categories } from "../enum/Categories";

export type TProduct = TBaseModel & {
  name: string;
  description: string;
  sku: string;
  price: number;
  stock: number;
  category: Categories;
  status: ProductStatus;
  image?: string;
  updatedAt?: string;
};
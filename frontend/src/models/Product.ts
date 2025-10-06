import { ProductStatus } from "../enum/ProductStatus";
import { Categories } from "../enum/Categories";

export type TProduct = {
  id?: string;
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
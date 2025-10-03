import { ProductStatus } from "../enum/ProductStatus";

export type Product = {
  id?: string;
  name: string;
  description: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
  status: ProductStatus;
  image?: string;
  updatedAt?: string;
};
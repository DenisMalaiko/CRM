export type Product = {
  id?: string;
  name: string;
  description: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
  status: string;
  image?: string | null;
  updatedAt?: string | Date;
};

export type ProductResponse = Partial<Product>
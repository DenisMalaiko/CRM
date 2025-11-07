export type Product = {
  id?: string;
  businessId: string;

  name: string;
  description: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
  status: string;
  image?: string | null;

  createdAt: Date | undefined;
  updatedAt: Date | undefined;
};

export type ProductResponse = Partial<Product>
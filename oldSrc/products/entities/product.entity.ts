export type Product = {
  id?: string;
  agencyId: string;

  name: string;
  description: string;
  sku: string;
  price: number;
  category: string;
  status: string;
  image?: string | null;

  embedding?: number[] | null;

  createdAt: Date | undefined;
  updatedAt: Date | undefined;
};

export type ProductResponse = Partial<Product>
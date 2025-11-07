export type Client = {
  id?: string;
  businessId: string;

  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  role: string;
  isActive: boolean;

  createdAt: Date | undefined;
  updatedAt: Date | undefined;
};

export type ClientResponse = Partial<Client>
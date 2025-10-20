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
  updatedAt?: string | Date;
};

export type ClientResponse = Partial<Client>
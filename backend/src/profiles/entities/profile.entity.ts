export type TProfile = {
  id: string;
  businessId: string;
  name: string;
  profileFocus: string;
  isActive: boolean;
  createdAt: Date;
}

export type TProfileCreate = Omit<TProfile, 'id' | "createdAt">;
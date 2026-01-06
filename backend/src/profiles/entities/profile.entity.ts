export type TProfile = {
  id: string;
  businessId: string;
  name: string;
  positioning: string;
  toneOfVoice: string;
  brandRules?: string | null;
  goals: string[];
  isActive: boolean;
  createdAt: Date;
}

export type TProfileCreate = Omit<TProfile, 'id' | "createdAt">;
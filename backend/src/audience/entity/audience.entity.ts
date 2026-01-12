export type TAudience = {
  id: string;
  businessId: string;
  name: string;
  ageRange: string;
  gender?: string | null;
  geo: string;
  pains: string[];
  desires: string[];
  triggers: string[];
  incomeLevel?: string | null;
}

export type TAudienceCreate = Omit<TAudience, 'id'>;
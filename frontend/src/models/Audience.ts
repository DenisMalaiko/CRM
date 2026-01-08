export type TAudienceCreate = {
  ageRange: string;
  gender: string;
  geo: string;
  pains: string[];
  desires: string[];
  triggers: string[];
  incomeLevel?: string;
}

export type TAudience = TAudienceCreate & {
  id: string;
  businessId: string;
}
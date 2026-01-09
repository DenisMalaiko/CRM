export type TAudienceCreate = {
  name: string;
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
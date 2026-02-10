type TAudienceBase = {
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

export type TAudience = TAudienceBase & {
  id: string;
}

export type TAudienceCreate = TAudienceBase;

export type TAudienceUpdate = TAudienceBase;
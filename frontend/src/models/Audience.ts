import { Gender } from "../enum/Gender";
import { IncomeLevel } from "../enum/IncomeLevel";

export type TAudienceCreate = {
  name: string;
  ageRange: string;
  gender: Gender;
  geo: string;
  pains: string[];
  desires: string[];
  triggers: string[];
  incomeLevel?: IncomeLevel;
}

export type TAudience = TAudienceCreate & {
  id: string;
  businessId: string;
}
import { TBusinessProfile } from "./BusinessProfile";

export type TPromptCreate = {
  businessId: string;
  name: string;
  purpose: string;
  text: string;
  isActive: boolean;
}

export type TPrompt = TPromptCreate & {
  id: string;
  createdAt: Date;
  profiles?: TBusinessProfile[];
}
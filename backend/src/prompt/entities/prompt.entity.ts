type TPromptBase = {
  businessId: string;
  name: string;
  purpose: string;
  text: string;
  isActive: boolean;
}

export type TPrompt = TPromptBase & {
  id: string;
  createdAt: Date;
};

export type TPromptCreate = TPromptBase;

export type TPromptUpdate = TPromptBase;
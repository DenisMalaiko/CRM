import { AIArtifactType } from "../enum/AIArtifactType";
import { AIArtifactStatus } from "../enum/AIArtifactStatus";
import { TProduct } from "./Product";

export type TAIArtifact = {
  id: string;
  businessId: string;
  businessProfileId: string;
  type: AIArtifactType;
  outputJson: any,
  status: AIArtifactStatus;
  products: TProduct[] | any;
  createdAt?: string | Date;
  imageUrl?: string;
  imagePrompt?: string;
}
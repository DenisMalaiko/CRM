import { AIArtifactType } from "../enum/AIArtifactType";
import { AIArtifactStatus } from "../enum/AIArtifactStatus";
import { MediaType } from "../enum/MediaType";
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
  mediaType?: MediaType;
  media: TAIArtifactMedia[];
}

type TAIArtifactMedia = {
  aiArtifactId: string;
  businessId: string;
  createdAt: Date;
  id: string;
  jobId: string;
  order: number;
  sourceUrl: string;
  type: MediaType;
  url: string;
}

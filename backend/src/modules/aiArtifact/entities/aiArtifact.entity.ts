import { AIArtifactType, AIArtifactStatus } from "@prisma/client";
import { TProduct } from "../../products/entities/product.entity";

export type AIArtifactBase = {
  businessId: string;
  businessProfileId: string | null;
  type: AIArtifactType;
  outputJson: any,
  status: AIArtifactStatus;
  products: TProduct[] | any;
  media?: { id: string; url: string | null; type: string; order: number; jobId: string | null }[];
}

export type CreateAIArtifact = {
  type: AIArtifactType;
  productsIds?: string[];
  audiencesIds?: string[];
  ideasIds?: string[];
  ideasAiIds?: string[];
  prompt?: string;
  photosIds?: string[];
  defaultPhotosIds?: string[];
};
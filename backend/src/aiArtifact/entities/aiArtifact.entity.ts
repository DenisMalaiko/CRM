import { AIArtifactType, AIArtifactStatus } from "@prisma/client";
import { TProduct } from "../../products/entities/product.entity";

export type AIArtifactBase = {
  businessId: string;
  businessProfileId: string;
  type: AIArtifactType;
  outputJson: any,
  status: AIArtifactStatus;
  products: TProduct[] | any;
}
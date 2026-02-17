import { TBaseModel } from "../../../shared/entities/BaseEntity";
import { TAgency } from "../../agency/entities/agency.entity";
import { BusinessStatus } from "@prisma/client";

export type TBusinessBase = {
  name: string;
  website: string;
  industry?: string | null;
  status: BusinessStatus;
  brand: string;
  advantages: string[];
  goals: string[];
}

export type TBusiness = TBaseModel & TBusinessBase & {
  agency?: TAgency;
};

export type TBusinessCreate = TBusinessBase & {
  agencyId: string;
}

export type TBusinessUpdate = TBusinessBase & {
  agencyId: string;
}
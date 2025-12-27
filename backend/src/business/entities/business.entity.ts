import { TBaseModel } from "../../entities/BaseEntity";
import { TAgency } from "../../agency/entities/agency.entity";
import { BusinessStatus } from "generated/prisma";

export type TBusiness = TBaseModel & {
  name: string;
  website: string;
  industry?: string | null;
  status: BusinessStatus;
  agency?: TAgency;
};

export type TBusinessCreate = {
  name: string;
  website: string;
  industry: string;
  status: BusinessStatus;
  agencyId: string;
}
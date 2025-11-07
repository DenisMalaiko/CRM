import { BusinessIndustry } from '../../generated/prisma';

export enum BusinessIndustryUI {
  BeautyWellness = "Beauty & Wellness",
  RetailEcommerce = "Retail & E-commerce",
  FoodBeverage = "Food & Beverage",
  ProfessionalServices = "Professional Services",
  RealEstateConstruction = "Real Estate & Construction",
}

export const BusinessIndustryToPrisma: Record<BusinessIndustryUI, BusinessIndustry> = {
  [BusinessIndustryUI.BeautyWellness]: BusinessIndustry.BeautyWellness,
  [BusinessIndustryUI.RetailEcommerce]: BusinessIndustry.RetailEcommerce,
  [BusinessIndustryUI.FoodBeverage]: BusinessIndustry.FoodBeverage,
  [BusinessIndustryUI.ProfessionalServices]: BusinessIndustry.ProfessionalServices,
  [BusinessIndustryUI.RealEstateConstruction]: BusinessIndustry.RealEstateConstruction,
};
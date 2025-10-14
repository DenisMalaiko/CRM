export enum BusinessIndustry {
  BeautyWellness = "Beauty & Wellness",
  RetailEcommerce = "Retail & E-commerce",
  FoodBeverage = "Food & Beverage",
  ProfessionalServices = "Professional Services",
  RealEstateConstruction = "Real Estate & Construction",
}

export const BusinessIndustryToPrisma: Record<BusinessIndustry, string> = {
  [BusinessIndustry.BeautyWellness]: "BeautyWellness",
  [BusinessIndustry.RetailEcommerce]: "RetailEcommerce",
  [BusinessIndustry.FoodBeverage]: "FoodBeverage",
  [BusinessIndustry.ProfessionalServices]: "ProfessionalServices",
  [BusinessIndustry.RealEstateConstruction]: "RealEstateConstruction",
};
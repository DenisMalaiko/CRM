export type IngestionContext = {
  businessId: string;
  profileId: string;

  products: {
    name: string;
    description: string;
    priceSegment: string;
    type: string;
  }[];

  audiences: {
    name: string;
    pains: string[];
    desires: string[];
    triggers: string[];
    incomeLevel: string;
  }[];

  focus: string;
};
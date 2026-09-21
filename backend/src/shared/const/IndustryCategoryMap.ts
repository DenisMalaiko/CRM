/**
 * Maps our business industries to newsdata.io API categories.
 * @see https://newsdata.io/documentation — available categories
 */
export const IndustryCategoryMap: Record<string, string> = {
  'Apparel & Accessories': 'lifestyle',
  'Baby, Kids & Maternity': 'lifestyle',
  'Beauty & Personal Care': 'lifestyle',
  'Business Services': 'business',
  Education: 'education',
  'Financial Services': 'business',
  'Food & Beverage': 'food',
  Games: 'entertainment',
  Health: 'health',
  'Home Improvement': 'domestic',
  'Household Products': 'domestic',
  'Life Services': 'domestic',
  'News & Entertainment': 'entertainment',
  Pets: 'lifestyle',
  'Sports & Outdoor': 'sports',
  'Tech & Electronics': 'technology',
  Travel: 'tourism',
  'Vehicle & Transportation': 'technology',
};

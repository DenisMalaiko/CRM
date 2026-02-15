export interface Option {
  label: string;
  value: string;
}

export const AdsStatusOptions: Option[] = [
  {
    label: "Active",
    value: "active",
  },
  {
    label: "Inactive",
    value: "inactive",
  },
  {
    label: "All",
    value: "all",
  }
];

export const AdsPeriodOptions: Option[] = [
  {
    label: "Last 24 hours",
    value: "last24h",
  },
  {
    label: "Last 7 days",
    value: "last7d",
  },
  {
    label: "Last 14 days",
    value: "last14d",
  },
  {
    label: "Last 30 days",
    value: "last30d",
  },
];

export const AdsSortOptions: Option[] = [
  {
    label: "Impressions",
    value: "impressions_desc",
  },
  {
    label: "Recents",
    value: "most_recent",
  }
]
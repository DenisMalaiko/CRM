export const GOOGLE_FONTS_CONFIG: Record<string, string> = {
  "Inter": "wght@100..900",
  "Roboto": "wght@100..900",
  "Open Sans": "wght@300;400;500;600;700",
  "Lato": "wght@300;400;700",
  "Montserrat": "wght@100..900",
  "Poppins": "wght@300;400;500;600;700",
  "Raleway": "wght@100..900",
  "Nunito": "wght@300;400;500;600;700",
  "Oswald": "wght@300;400;500;600;700",
  "Playfair Display": "wght@400;500;600;700",
  "Merriweather": "wght@300;400;700",
  "Source Sans 3": "wght@300;400;500;600;700",
  "PT Sans": "wght@400;700",
  "Fira Sans": "wght@300;400;500;600;700",
  "Work Sans": "wght@100..900",
  "DM Sans": "wght@100..900",
  "Space Grotesk": "wght@300;400;500;600;700",
  "Bitter": "wght@100..900",
  "Crimson Text": "wght@400;600;700",
  "Libre Baskerville": "wght@400;700",
  "Lora": "wght@400;500;600;700",
  "Source Sans Pro": "wght@300;400;600;700",
};

export const GOOGLE_FONTS = Object.keys(GOOGLE_FONTS_CONFIG);

export const SYSTEM_FONTS = [
  "Arial",
  "Verdana",
  "Tahoma",
  "Trebuchet MS",
  "Georgia",
  "Times New Roman",
  "Palatino Linotype",
  "Garamond",
  "Courier New",
  "Lucida Console",
  "Impact",
  "Comic Sans MS",
];

export const GENERIC_FONTS = [
  "system-ui",
  "sans-serif",
  "serif",
  "monospace",
  "cursive",
];

export const Fonts = [...GOOGLE_FONTS, ...SYSTEM_FONTS, ...GENERIC_FONTS];

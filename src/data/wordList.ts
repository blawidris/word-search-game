export type WordEntry = {
  id: string;
  display: string;
  value: string;
};

export const WORD_LIST: WordEntry[] = [
  { id: 'BEYOND', display: 'Beyond', value: 'BEYOND' },
  { id: 'THEHORIZON', display: 'The Horizon', value: 'THEHORIZON' },
  { id: 'JETOUR', display: 'Jetour', value: 'JETOUR' },
  { id: 'WMOTORS', display: 'W Motors', value: 'WMOTORS' },
  { id: 'TRAVELER', display: 'Traveler', value: 'TRAVELER' },
  { id: 'GAIA', display: 'Gaia', value: 'GAIA' },
  { id: 'PHEV', display: 'PHEV', value: 'PHEV' },
  { id: 'DRIVE', display: 'Drive', value: 'DRIVE' },
  { id: 'THEFUTURE', display: 'The Future', value: 'THEFUTURE' },
  { id: 'NIGERIA', display: 'Nigeria', value: 'NIGERIA' },
  { id: 'LAUNCHING', display: 'Launching', value: 'LAUNCHING' },
  { id: 'UNVEIL', display: 'Unveil', value: 'UNVEIL' },
  { id: 'BEAST', display: 'Beast', value: 'BEAST' },
  { id: 'G700', display: 'G700', value: 'G700' },
  { id: 'JOURNEY', display: 'Journey', value: 'JOURNEY' },
  { id: 'LUXURY', display: 'Luxury', value: 'LUXURY' },
  { id: 'COMFORT', display: 'Comfort', value: 'COMFORT' },
  { id: 'INTELLIGENCE', display: 'Intelligence', value: 'INTELLIGENCE' },
  { id: 'SOPHISTICATED', display: 'Sophisticated', value: 'SOPHISTICATED' },
];

export const TOTAL_WORDS = WORD_LIST.length;

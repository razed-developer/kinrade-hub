export interface MarineLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  tideSearch: string;
  timezone: string;
}

export const locations: MarineLocation[] = [
  { id: "nanaimo", name: "Nanaimo", latitude: 49.1659, longitude: -123.9401, tideSearch: "Nanaimo", timezone: "America/Vancouver" },
  { id: "ladysmith", name: "Ladysmith", latitude: 48.9975, longitude: -123.8203, tideSearch: "Ladysmith", timezone: "America/Vancouver" },
  { id: "victoria", name: "Victoria", latitude: 48.4284, longitude: -123.3656, tideSearch: "Victoria", timezone: "America/Vancouver" },
  { id: "comox", name: "Comox", latitude: 49.6735, longitude: -124.9283, tideSearch: "Comox", timezone: "America/Vancouver" },
  { id: "campbell-river", name: "Campbell River", latitude: 50.0244, longitude: -125.2475, tideSearch: "Campbell River", timezone: "America/Vancouver" }
];

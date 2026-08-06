export interface TideStation {
  id: string;
  name: string;
  code?: string;
  latitude?: number;
  longitude?: number;
}

export interface TidePoint {
  time: string;
  height: number;
  type?: "high" | "low" | "prediction";
}

export interface TideForecast {
  station: TideStation;
  points: TidePoint[];
  events: TidePoint[];
}

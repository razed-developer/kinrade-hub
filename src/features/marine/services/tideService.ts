import type { TideForecast, TidePoint, TideStation } from "../types/tides";
import { isoUtc } from "../utils/format";

const API = "https://api-iwls.dfo-mpo.gc.ca/api/v1";

function stringValue(record: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return undefined;
}

function numberValue(record: Record<string, unknown>, keys: string[]): number | undefined {
  for (const key of keys) {
    const value = Number(record[key]);
    if (Number.isFinite(value)) return value;
  }
  return undefined;
}

function normalizeStation(raw: unknown): TideStation | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;
  const id = stringValue(record, ["id", "stationId", "_id"]);
  const name = stringValue(record, ["officialName", "name", "stationName"]);
  if (!id || !name) return null;
  return {
    id,
    name,
    code: stringValue(record, ["code", "stationCode"]),
    latitude: numberValue(record, ["latitude", "lat"]),
    longitude: numberValue(record, ["longitude", "lon", "lng"])
  };
}

function normalizePoint(raw: unknown, type?: TidePoint["type"]): TidePoint | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;
  const time = stringValue(record, ["eventDate", "time", "date"]);
  const height = numberValue(record, ["value", "height", "waterLevel"]);
  if (!time || height === undefined) return null;
  const eventTypeRaw = stringValue(record, ["event", "type", "eventType"])?.toLowerCase();
  const eventType = eventTypeRaw?.includes("high") ? "high" : eventTypeRaw?.includes("low") ? "low" : type;
  return { time, height, type: eventType };
}

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Tide request failed (${response.status})`);
  return response.json();
}

export async function findTideStation(searchName: string, latitude: number, longitude: number): Promise<TideStation> {
  const raw = await fetchJson(`${API}/stations`);
  const records = Array.isArray(raw) ? raw : ((raw as Record<string, unknown>)?.stations as unknown[]) ?? [];
  const stations = records.map(normalizeStation).filter((station): station is TideStation => station !== null);
  const words = searchName.toLowerCase().split(/\s+/);
  const named = stations.filter((station) => words.every((word) => station.name.toLowerCase().includes(word)));
  const candidates = named.length ? named : stations;
  if (!candidates.length) throw new Error("No Canadian tide stations were returned.");

  return [...candidates].sort((a, b) => {
    const distance = (station: TideStation) => {
      if (station.latitude === undefined || station.longitude === undefined) return Number.POSITIVE_INFINITY;
      return Math.hypot(station.latitude - latitude, station.longitude - longitude);
    };
    return distance(a) - distance(b);
  })[0];
}

async function fetchSeries(stationId: string, code: string, from: Date, to: Date): Promise<TidePoint[]> {
  const params = new URLSearchParams({
    "time-series-code": code,
    from: isoUtc(from),
    to: isoUtc(to)
  });
  const raw = await fetchJson(`${API}/stations/${encodeURIComponent(stationId)}/data?${params}`);
  const records = Array.isArray(raw) ? raw : ((raw as Record<string, unknown>)?.data as unknown[]) ?? [];
  return records.map((item) => normalizePoint(item, code === "wlp-hilo" ? undefined : "prediction")).filter((point): point is TidePoint => point !== null);
}

export async function fetchTides(searchName: string, latitude: number, longitude: number): Promise<TideForecast> {
  const station = await findTideStation(searchName, latitude, longitude);
  const from = new Date();
  from.setHours(from.getHours() - 3);
  const to = new Date();
  to.setHours(to.getHours() + 72);

  const [pointsResult, eventsResult] = await Promise.allSettled([
    fetchSeries(station.id, "wlp", from, to),
    fetchSeries(station.id, "wlp-hilo", from, to)
  ]);

  const points = pointsResult.status === "fulfilled" ? pointsResult.value : [];
  const events = eventsResult.status === "fulfilled" ? eventsResult.value : [];
  if (!points.length && !events.length) throw new Error("The station was found, but no prediction series was available.");
  return { station, points: points.length ? points : events, events };
}

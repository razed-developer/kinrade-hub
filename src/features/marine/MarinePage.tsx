import { useEffect, useState } from "react";
import "./marine.css";
import { locations } from "./data/locations";
import { fetchTides } from "./services/tideService";
import { fetchWeather } from "./services/weatherService";
import type { TideForecast } from "./types/tides";
import type { WeatherForecast } from "./types/weather";
import { TidePanel } from "./components/TidePanel";
import { WeatherPanel } from "./components/WeatherPanel";

export function MarinePage() {
  const [locationId, setLocationId] = useState("nanaimo");
  const [weather, setWeather] = useState<WeatherForecast | null>(null);
  const [tides, setTides] = useState<TideForecast | null>(null);
  const [weatherError, setWeatherError] = useState("");
  const [tideError, setTideError] = useState("");
  const [loading, setLoading] = useState(false);
  const location = locations.find((item) => item.id === locationId) ?? locations[0];

  async function load() {
    setLoading(true); setWeatherError(""); setTideError(""); setWeather(null); setTides(null);
    const [weatherResult, tideResult] = await Promise.allSettled([
      fetchWeather(location.latitude, location.longitude, location.timezone),
      fetchTides(location.tideSearch, location.latitude, location.longitude)
    ]);
    if (weatherResult.status === "fulfilled") setWeather(weatherResult.value);
    else setWeatherError(weatherResult.reason instanceof Error ? weatherResult.reason.message : "Weather could not be loaded.");
    if (tideResult.status === "fulfilled") setTides(tideResult.value);
    else setTideError(tideResult.reason instanceof Error ? tideResult.reason.message : "Tides could not be loaded.");
    setLoading(false);
  }

  useEffect(() => { void load(); }, [locationId]);

  return (
    <main className="marine-page">
      <header className="hero">
        <div><p className="eyebrow">Vancouver Island marine dashboard</p><h1>Weather & Tides</h1><p>Forecast conditions and Canadian Hydrographic Service tide predictions in one place.</p></div>
        <div className="controls"><label htmlFor="location">Location</label><select id="location" value={locationId} onChange={(event) => setLocationId(event.target.value)}>{locations.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select><button type="button" onClick={() => void load()} disabled={loading}>{loading ? "Refreshing…" : "Refresh data"}</button></div>
      </header>
      <div className="notice"><strong>Planning aid only.</strong> Confirm official forecasts, notices, charts, and local conditions before navigation.</div>
      {loading && !weather && !tides && <div className="loading">Loading live marine conditions…</div>}
      {weatherError && <div className="error"><strong>Weather unavailable:</strong> {weatherError}</div>}
      {weather && <WeatherPanel forecast={weather}/>} 
      {tideError && <div className="error"><strong>Tides unavailable:</strong> {tideError}<br/><small>The federal API occasionally blocks browser requests or has station-specific gaps. See README.md for troubleshooting.</small></div>}
      {tides && <TidePanel forecast={tides} timezone={location.timezone}/>} 
      <footer>Weather: Open-Meteo · Tides: Fisheries and Oceans Canada / Canadian Hydrographic Service</footer>
    </main>
  );
}

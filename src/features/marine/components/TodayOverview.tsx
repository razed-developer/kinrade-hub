import type { CSSProperties } from "react";
import type { TideForecast, TidePoint } from "../types/tides";
import type { HourlyWeather, WeatherForecast } from "../types/weather";
import { compassDirection, formatTime } from "../utils/format";
import { weatherIcon, weatherLabel } from "../utils/weatherCodes";

const GREEN_LEVEL = 3;
const RED_LEVEL = 1.8;

function localDateKey(time: string, timezone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: timezone,
  }).format(new Date(time));
}

function localHour(time: string, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: timezone,
  }).formatToParts(new Date(time));
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? 0);
  return hour + minute / 60;
}

function positionStyle(time: string, timezone: string): CSSProperties {
  return { left: `${(localHour(time, timezone) / 24) * 100}%` };
}

function accessClass(height: number) {
  if (height >= GREEN_LEVEL) return "access-green";
  if (height <= RED_LEVEL) return "access-red";
  return "access-yellow";
}

function todayKey(timezone: string) {
  return localDateKey(new Date().toISOString(), timezone);
}

function weatherSamples(forecast: WeatherForecast) {
  const today = todayKey(forecast.timezone);
  const hours = forecast.hourly.filter((hour) => localDateKey(hour.time, forecast.timezone) === today);
  const targets = [6, 12, 18, 23];
  const selected = targets
    .map((target) => hours.reduce<typeof hours[number] | undefined>((closest, hour) => {
      if (!closest) return hour;
      return Math.abs(localHour(hour.time, forecast.timezone) - target) < Math.abs(localHour(closest.time, forecast.timezone) - target) ? hour : closest;
    }, undefined))
    .filter((hour): hour is HourlyWeather => Boolean(hour));
  return selected.filter((hour, index) => selected.findIndex((item) => item.time === hour.time) === index);
}

function todayTides(forecast: TideForecast, timezone: string) {
  const today = todayKey(timezone);
  return forecast.events
    .filter((event) => localDateKey(event.time, timezone) === today && (event.type === "high" || event.type === "low"))
    .sort((a, b) => Date.parse(a.time) - Date.parse(b.time));
}

function todayAccessSegments(forecast: TideForecast, timezone: string) {
  const today = todayKey(timezone);
  return forecast.points
    .filter((point) => localDateKey(point.time, timezone) === today)
    .sort((a, b) => Date.parse(a.time) - Date.parse(b.time));
}

export function TodayOverview({ weather, tides, timezone }: { weather: WeatherForecast | null; tides: TideForecast | null; timezone: string }) {
  const samples = weather ? weatherSamples(weather) : [];
  const events = tides ? todayTides(tides, timezone) : [];
  const points = tides ? todayAccessSegments(tides, timezone) : [];

  return (
    <section className="today-overview" aria-labelledby="today-heading">
      <div className="section-heading">
        <div><p className="eyebrow">Today at a glance</p><h2 id="today-heading">Weather &amp; ramp access</h2></div>
        <div className="access-legend" aria-label="Ramp access legend">
          <span><i className="access-green" />Good ≥ 3.0 m</span>
          <span><i className="access-yellow" />Moderate</span>
          <span><i className="access-red" />Steep ≤ 1.8 m</span>
        </div>
      </div>

      {samples.length ? (
        <div className="today-weather-strip">
          {samples.map((hour) => (
            <article key={hour.time}>
              <strong>{formatTime(hour.time, forecastTimezone(weather, timezone))}</strong>
              <span className="today-weather-icon" aria-hidden="true">{weatherIcon(hour.weatherCode)}</span>
              <b>{Math.round(hour.temperature)}°C</b>
              <small>{weatherLabel(hour.weatherCode)}</small>
              <small>{compassDirection(hour.windDirection)} {Math.round(hour.windSpeed)} km/h</small>
            </article>
          ))}
        </div>
      ) : <p className="empty">Today’s weather summary is unavailable.</p>}

      {points.length ? (
        <div className="today-access-chart">
          <div className="today-access-track" aria-label="Today’s predicted ramp access by tide height">
            {points.slice(0, -1).map((point, index) => {
              const next = points[index + 1];
              const start = localHour(point.time, timezone);
              const end = localHour(next.time, timezone);
              return <span key={point.time} className={accessClass((point.height + next.height) / 2)} style={{ left: `${(start / 24) * 100}%`, width: `${((end - start) / 24) * 100}%` }} />;
            })}
            {events.map((event) => <i key={`${event.type}-${event.time}`} className={`today-tide-marker today-tide-marker-${event.type}`} style={positionStyle(event.time, timezone)} />)}
          </div>
          <div className="tide-time-axis" aria-hidden="true"><span>12 am</span><span>6 am</span><span>12 pm</span><span>6 pm</span><span>12 am</span></div>
          <div className="today-tide-events">
            {events.map((event) => (
              <span key={`today-${event.type}-${event.time}`} className={event.type === "high" ? "event-high" : "event-low"}>
                {event.type === "high" ? "High" : "Low"} {formatTime(event.time, timezone)} · {event.height.toFixed(2)} m
              </span>
            ))}
          </div>
        </div>
      ) : <p className="empty">Today’s tide-access summary is unavailable.</p>}
    </section>
  );
}

function forecastTimezone(weather: WeatherForecast | null, fallback: string) {
  return weather?.timezone ?? fallback;
}

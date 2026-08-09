import type { CSSProperties } from "react";
import type { TideForecast, TidePoint } from "../types/tides";
import { TideChart } from "./TideChart";

const HOURS_IN_DAY = 24;
const BAND_RADIUS_HOURS = 3;

function localDateKey(time: string, timezone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: timezone,
  }).format(new Date(time));
}

function eventTime(event: TidePoint, timezone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: timezone,
  }).format(new Date(event.time));
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

function bandStrength(event: TidePoint, events: TidePoint[]) {
  const matching = events.filter((item) => item.type === event.type).map((item) => item.height);
  const min = Math.min(...matching);
  const max = Math.max(...matching);
  if (max === min) return 0.68;
  const normalized = (event.height - min) / (max - min);
  return event.type === "high" ? 0.36 + normalized * 0.54 : 0.36 + (1 - normalized) * 0.54;
}

function bandStyle(event: TidePoint, events: TidePoint[], timezone: string): CSSProperties {
  const centre = localHour(event.time, timezone);
  const start = Math.max(0, centre - BAND_RADIUS_HOURS);
  const end = Math.min(HOURS_IN_DAY, centre + BAND_RADIUS_HOURS);
  const strength = bandStrength(event, events);
  const colour = event.type === "high" ? `rgba(21, 128, 61, ${strength})` : `rgba(185, 28, 28, ${strength})`;
  return {
    left: `${(start / HOURS_IN_DAY) * 100}%`,
    width: `${((end - start) / HOURS_IN_DAY) * 100}%`,
    backgroundColor: colour,
  };
}

function markerStyle(event: TidePoint, timezone: string): CSSProperties {
  return { left: `${(localHour(event.time, timezone) / HOURS_IN_DAY) * 100}%` };
}

export function TidePanel({ forecast, timezone }: { forecast: TideForecast; timezone: string }) {
  const today = localDateKey(new Date().toISOString(), timezone);
  const calendarEvents = forecast.events.filter((event) => localDateKey(event.time, timezone) >= today);
  const dates = [...new Set(calendarEvents.map((event) => localDateKey(event.time, timezone)))].slice(0, 14);

  return (
    <section aria-labelledby="tides-heading">
      <div className="section-heading">
        <div><p className="eyebrow">Official CHS predictions</p><h2 id="tides-heading">Tides</h2></div>
        <span className="updated">{forecast.station.name}</span>
      </div>
      <TideChart points={forecast.points} events={forecast.events} timezone={timezone} />

      <div className="tide-calendar-heading">
        <div>
          <h3>14-day tide calendar</h3>
          <p className="forecast-note">Each coloured band covers three hours before and after the tide. Darker green means a higher high tide; darker red means a lower low tide.</p>
        </div>
        <div className="tide-legend" aria-label="Tide calendar legend">
          <span><i className="legend-high" />High tide</span>
          <span><i className="legend-low" />Low tide</span>
        </div>
      </div>

      {dates.length ? (
        <div className="tide-calendar-scroll">
          <div className="tide-calendar">
            {dates.map((date) => {
              const events = calendarEvents.filter((event) => localDateKey(event.time, timezone) === date && (event.type === "high" || event.type === "low"));
              const displayDate = new Intl.DateTimeFormat("en-CA", {
                weekday: "short",
                month: "short",
                day: "numeric",
                timeZone: timezone,
              }).format(new Date(`${date}T12:00:00`));

              return (
                <article className="tide-calendar-day" key={date}>
                  <strong>{displayDate}</strong>
                  <div className="tide-day-track" aria-label={`Tides for ${displayDate}`}>
                    {events.map((event) => (
                      <div
                        className={`tide-band tide-band-${event.type}`}
                        key={`${event.time}-${event.type}`}
                        style={bandStyle(event, calendarEvents, timezone)}
                        title={`${event.type === "high" ? "High" : "Low"} tide: ${eventTime(event, timezone)} · ${event.height.toFixed(2)} m`}
                      />
                    ))}
                    {events.map((event) => (
                      <span
                        className={`tide-marker tide-marker-${event.type}`}
                        key={`marker-${event.time}-${event.type}`}
                        style={markerStyle(event, timezone)}
                        title={`${event.type === "high" ? "High" : "Low"} tide: ${eventTime(event, timezone)} · ${event.height.toFixed(2)} m`}
                      />
                    ))}
                  </div>
                  <div className="tide-time-axis" aria-hidden="true"><span>12a</span><span>6a</span><span>12p</span><span>6p</span><span>12a</span></div>
                  <div className="tide-events">
                    {events.map((event) => <span key={`label-${event.time}-${event.type}`} className={event.type === "high" ? "event-high" : "event-low"}>{event.type === "high" ? "H" : "L"} {eventTime(event, timezone)} · {event.height.toFixed(2)} m</span>)}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      ) : <p className="empty">High and low tide predictions are unavailable.</p>}
    </section>
  );
}

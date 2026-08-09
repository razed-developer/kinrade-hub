import type { TideForecast, TidePoint } from "../types/tides";
import { TideChart } from "./TideChart";

function localDateKey(time: string, timezone: string) {
  return new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: timezone }).format(new Date(time));
}

function eventTime(event: TidePoint, timezone: string) {
  return new Intl.DateTimeFormat("en-CA", { hour: "numeric", minute: "2-digit", timeZone: timezone }).format(new Date(event.time));
}

export function TidePanel({ forecast, timezone }: { forecast: TideForecast; timezone: string }) {
  const now = Date.now();
  const futureEvents = forecast.events.filter((event) => Date.parse(event.time) >= now);
  const dates = [...new Set(futureEvents.map((event) => localDateKey(event.time, timezone)))].slice(0, 14);

  return (
    <section aria-labelledby="tides-heading">
      <div className="section-heading"><div><p className="eyebrow">Official CHS predictions</p><h2 id="tides-heading">Marina ramp access</h2></div><span className="updated">{forecast.station.name}</span></div>
      <p className="forecast-note">Higher water generally means a flatter, easier marina ramp. At low tide the ramp can approach a 45° angle. This is an accessibility guide, not a vessel-clearance calculation.</p>
      <TideChart points={forecast.points} timezone={timezone}/>
      <h3>14-day ramp outlook</h3>
      {dates.length ? <div className="ramp-grid">{dates.map((date, index) => {
        const events = futureEvents.filter((event) => localDateKey(event.time, timezone) === date);
        const highs = events.filter((event) => event.type === "high").sort((a, b) => b.height - a.height);
        const lows = events.filter((event) => event.type === "low").sort((a, b) => a.height - b.height);
        const best = highs[0];
        const steepest = lows[0];
        const displayDate = new Intl.DateTimeFormat("en-CA", { weekday: "short", month: "short", day: "numeric", timeZone: timezone }).format(new Date(`${date}T12:00:00`));
        return <article key={date} className={`ramp-day ${index >= 7 ? "lower-confidence" : ""}`}>
          <div className="day-heading"><strong>{displayDate}</strong>{index >= 7 && <span className="confidence-badge">Forecast weather less certain</span>}</div>
          {best ? <p className="best-access"><span>Best ramp access</span><b>{eventTime(best, timezone)}</b><small>High tide · {best.height.toFixed(2)} m</small></p> : <p className="empty">High tide unavailable</p>}
          {steepest ? <p className="steep-access"><span>Steepest ramp</span><b>{eventTime(steepest, timezone)}</b><small>Low tide · {steepest.height.toFixed(2)} m</small></p> : <p className="empty">Low tide unavailable</p>}
        </article>;
      })}</div> : <p className="empty">High/low predictions were unavailable, but the short-term tide curve above may still be shown.</p>}
    </section>
  );
}

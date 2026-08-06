import type { TideForecast } from "../types/tides";
import { formatTime } from "../utils/format";
import { TideChart } from "./TideChart";

export function TidePanel({ forecast, timezone }: { forecast: TideForecast; timezone: string }) {
  const upcoming = forecast.events.filter((event) => Date.parse(event.time) >= Date.now()).slice(0, 8);
  return (
    <section aria-labelledby="tides-heading">
      <div className="section-heading"><div><p className="eyebrow">Official CHS predictions</p><h2 id="tides-heading">Tides</h2></div><span className="updated">{forecast.station.name}</span></div>
      <TideChart points={forecast.points} timezone={timezone}/>
      <h3>Upcoming highs and lows</h3>
      {upcoming.length ? <div className="tide-events">{upcoming.map((event) => <article key={`${event.time}-${event.height}`} className={`tide-event ${event.type ?? ""}`}><span>{event.type === "high" ? "▲ High" : event.type === "low" ? "▼ Low" : "Tide"}</span><strong>{event.height.toFixed(2)} m</strong><small>{new Intl.DateTimeFormat("en-CA", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: timezone }).format(new Date(event.time))}</small></article>)}</div> : <p className="empty">High/low events were unavailable, but the tide curve above may still be shown.</p>}
    </section>
  );
}

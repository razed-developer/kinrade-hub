import type { WeatherForecast } from "../types/weather";
import { compassDirection, formatDay, formatTime } from "../utils/format";
import { weatherIcon, weatherLabel } from "../utils/weatherCodes";

export function WeatherPanel({ forecast }: { forecast: WeatherForecast }) {
  const { current } = forecast;
  return (
    <section aria-labelledby="weather-heading">
      <div className="section-heading">
        <div><p className="eyebrow">Live forecast</p><h2 id="weather-heading">Weather</h2></div>
        <span className="updated">Updated {formatTime(current.time, forecast.timezone)}</span>
      </div>
      <div className="current-grid">
        <article className="current-card">
          <span className="weather-big-icon" aria-hidden="true">{weatherIcon(current.weatherCode)}</span>
          <div><strong>{Math.round(current.temperature)}°C</strong><p>{weatherLabel(current.weatherCode)}</p><small>Feels like {Math.round(current.apparentTemperature)}°C</small></div>
        </article>
        <article className="metric"><span>Wind</span><strong>{compassDirection(current.windDirection)} {Math.round(current.windSpeed)} km/h</strong><small>Gusts {Math.round(current.windGusts)} km/h</small></article>
        <article className="metric"><span>Humidity</span><strong>{Math.round(current.humidity)}%</strong><small>Precipitation {current.precipitation.toFixed(1)} mm</small></article>
      </div>
      <h3>Next 24 hours</h3>
      <div className="hourly-strip">
        {forecast.hourly.slice(0, 12).map((hour) => (
          <article className="hour" key={hour.time}>
            <strong>{formatTime(hour.time, forecast.timezone)}</strong>
            <span aria-label={weatherLabel(hour.weatherCode)}>{weatherIcon(hour.weatherCode)}</span>
            <b>{Math.round(hour.temperature)}°</b>
            <small>Rain {hour.precipitationProbability}%</small>
            <small>{compassDirection(hour.windDirection)} {Math.round(hour.windSpeed)}</small>
          </article>
        ))}
      </div>
      <h3>Seven-day outlook</h3>
      <div className="daily-grid">
        {forecast.daily.map((day) => (
          <article className="day" key={day.date}>
            <strong>{formatDay(day.date, forecast.timezone)}</strong>
            <span>{weatherIcon(day.weatherCode)} {weatherLabel(day.weatherCode)}</span>
            <b>{Math.round(day.temperatureMax)}° / {Math.round(day.temperatureMin)}°</b>
            <small>Rain {day.precipitationProbabilityMax}% · Gusts {Math.round(day.windGustsMax)} km/h</small>
          </article>
        ))}
      </div>
    </section>
  );
}

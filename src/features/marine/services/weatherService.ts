import type { WeatherForecast } from "../types/weather";

interface OpenMeteoResponse {
  timezone: string;
  current: Record<string, number | string>;
  hourly: Record<string, Array<number | string>>;
  daily: Record<string, Array<number | string>>;
}

export async function fetchWeather(latitude: number, longitude: number, timezone: string): Promise<WeatherForecast> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    timezone,
    forecast_days: "7",
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m",
    hourly: "temperature_2m,precipitation_probability,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max"
  });

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!response.ok) throw new Error(`Weather request failed (${response.status})`);
  const data = (await response.json()) as OpenMeteoResponse;

  const current = data.current;
  const hourlyStart = Math.max(0, (data.hourly.time as string[]).findIndex((time) => new Date(time) >= new Date(String(current.time))));

  return {
    timezone: data.timezone,
    current: {
      time: String(current.time),
      temperature: Number(current.temperature_2m),
      apparentTemperature: Number(current.apparent_temperature),
      humidity: Number(current.relative_humidity_2m),
      precipitation: Number(current.precipitation),
      weatherCode: Number(current.weather_code),
      windSpeed: Number(current.wind_speed_10m),
      windDirection: Number(current.wind_direction_10m),
      windGusts: Number(current.wind_gusts_10m)
    },
    hourly: (data.hourly.time as string[]).slice(hourlyStart, hourlyStart + 24).map((time, index) => ({
      time,
      temperature: Number(data.hourly.temperature_2m[hourlyStart + index]),
      precipitationProbability: Number(data.hourly.precipitation_probability[hourlyStart + index]),
      weatherCode: Number(data.hourly.weather_code[hourlyStart + index]),
      windSpeed: Number(data.hourly.wind_speed_10m[hourlyStart + index]),
      windDirection: Number(data.hourly.wind_direction_10m[hourlyStart + index]),
      windGusts: Number(data.hourly.wind_gusts_10m[hourlyStart + index])
    })),
    daily: (data.daily.time as string[]).map((date, index) => ({
      date,
      weatherCode: Number(data.daily.weather_code[index]),
      temperatureMax: Number(data.daily.temperature_2m_max[index]),
      temperatureMin: Number(data.daily.temperature_2m_min[index]),
      precipitationProbabilityMax: Number(data.daily.precipitation_probability_max[index]),
      windSpeedMax: Number(data.daily.wind_speed_10m_max[index]),
      windGustsMax: Number(data.daily.wind_gusts_10m_max[index])
    }))
  };
}

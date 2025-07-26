// src/integrations/weather.ts
const WEATHER_API = "https://api.openweathermap.org/data/2.5/forecast";
const WEATHER_API_KEY = import.meta.env.VITE_OPENWEATHERMAP_KEY;

export type WeatherPeriod = {
  time: string;
  temperature: number;
  condition: "sunny" | "cloudy" | "rainy" | "snowy";
};

export type WeatherData = {
  location: string;
  today: WeatherPeriod[];
  tomorrow: WeatherPeriod[];
};

function mapCondition(weather: string): "sunny" | "cloudy" | "rainy" | "snowy" {
  if (weather.includes("rain")) return "rainy";
  if (weather.includes("cloud")) return "cloudy";
  if (weather.includes("snow")) return "snowy";
  if (weather.includes("clear")) return "sunny";
  return "cloudy";
}

export async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const url = `${WEATHER_API}?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Weather API fetch failed");

  const data = await res.json();
  const location = `${data.city.name}, ${data.city.country}`;

  const now = new Date();
  const today: WeatherPeriod[] = [];
  const tomorrow: WeatherPeriod[] = [];
  data.list.forEach((period: any) => {
    const dt = new Date(period.dt_txt);
    const cond = mapCondition(period.weather[0].main.toLowerCase());
    const entry: WeatherPeriod = {
      time: dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      temperature: Math.round(period.main.temp),
      condition: cond,
    };
    if (dt.getDate() === now.getDate()) today.push(entry);
    if (dt.getDate() === now.getDate() + 1) tomorrow.push(entry);
  });

  return { location, today: today.slice(0, 4), tomorrow: tomorrow.slice(0, 4) };
}

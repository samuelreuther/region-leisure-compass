import { Sun, Cloud, CloudRain, Snowflake } from "lucide-react";

export type WeatherPeriod = {
  time: string;
  temperature: number;
  condition: string; // beliebiger API-String
};

export type WeatherData = {
  location: string;
  today: WeatherPeriod[];
  tomorrow: WeatherPeriod[];
};

// Hilfsfunktion für API-Strings → 4 Standardwerte
function normalizeCondition(raw: string): "sunny" | "cloudy" | "rainy" | "snowy" {
  const c = raw.toLowerCase();
  if (c.includes("sun") || c.includes("clear")) return "sunny";
  if (c.includes("rain") || c.includes("shower") || c.includes("drizzle")) return "rainy";
  if (c.includes("snow")) return "snowy";
  if (c.includes("cloud") || c.includes("overcast") || c.includes("fog") || c.includes("mist")) return "cloudy";
  return "cloudy";
}

// Farb- und Icon-Mapping nach Wetterlage
function getCardStyle(condition: string) {
  switch (condition) {
    case "sunny":
      return { bg: "bg-yellow-200", icon: <Sun className="text-yellow-500" size={32} /> };
    case "rainy":
      return { bg: "bg-blue-300 text-white", icon: <CloudRain className="text-blue-700" size={32} /> };
    case "snowy":
      return { bg: "bg-blue-100 text-blue-700", icon: <Snowflake className="text-blue-500" size={32} /> };
    default:
      return { bg: "bg-gray-200", icon: <Cloud className="text-gray-500" size={32} /> };
  }
}

// Bestimmt den "dominanten" Zustand für den Tages-Background
function getDominantCondition(periods: WeatherPeriod[]) {
  const counts = { sunny: 0, cloudy: 0, rainy: 0, snowy: 0 };
  periods.forEach(p => counts[normalizeCondition(p.condition)]++);
  const max = Math.max(...Object.values(counts));
  const [dom] = Object.entries(counts).find(([_, c]) => c === max) || ["cloudy"];
  return dom as "sunny" | "cloudy" | "rainy" | "snowy";
}

interface Props {
  weather: WeatherData | null;
}

const WeatherCard = ({ weather }: Props) => {
  if (!weather) return <div className="bg-gray-100 rounded-xl p-4 text-center">Keine Wetterdaten verfügbar.</div>;

  const dominantToday = getDominantCondition(weather.today);
  const dominantTomorrow = getDominantCondition(weather.tomorrow);

  const todayStyle = getCardStyle(dominantToday);
  const tomorrowStyle = getCardStyle(dominantTomorrow);

  return (
    <div>
      {/* Heute */}
      <div className={`rounded-2xl shadow-lg p-4 mb-4 flex flex-col items-center ${todayStyle.bg}`}>
        <div className="flex items-center gap-2 mb-2">
          {todayStyle.icon}
          <span className="text-lg font-bold">Heute</span>
        </div>
        <div className="flex gap-4">
          {weather.today.map((period, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-xs">{period.time}</span>
              <span className="text-xl font-bold">{period.temperature}°C</span>
              {getCardStyle(normalizeCondition(period.condition)).icon}
            </div>
          ))}
        </div>
      </div>
      {/* Morgen */}
      <div className={`rounded-2xl shadow-lg p-4 flex flex-col items-center ${tomorrowStyle.bg}`}>
        <div className="flex items-center gap-2 mb-2">
          {tomorrowStyle.icon}
          <span className="text-lg font-bold">Morgen</span>
        </div>
        <div className="flex gap-4">
          {weather.tomorrow.map((period, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-xs">{period.time}</span>
              <span className="text-xl font-bold">{period.temperature}°C</span>
              {getCardStyle(normalizeCondition(period.condition)).icon}
            </div>
          ))}
        </div>
      </div>
      <div className="text-center mt-2 text-xs text-gray-500">
        {weather.location}
      </div>
    </div>
  );
};

export default WeatherCard;

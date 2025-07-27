import { Cloud, Sun, CloudRain, Snowflake } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const dayParts = ["Morning", "Noon", "Afternoon", "Evening"];

interface WeatherPeriod {
  time: string;
  temperature: number;
  condition: string; // Beliebiger API-String!
}

interface WeatherData {
  location: string;
  today: WeatherPeriod[];
  tomorrow: WeatherPeriod[];
}

interface WeatherCardProps {
  weather: WeatherData;
}

function normalizeCondition(raw: string): "sunny" | "cloudy" | "rainy" | "snowy" {
  const c = raw.toLowerCase();
  if (c.includes("sun") || c.includes("clear")) return "sunny";
  if (c.includes("rain") || c.includes("shower") || c.includes("drizzle")) return "rainy";
  if (c.includes("snow")) return "snowy";
  if (c.includes("cloud") || c.includes("overcast") || c.includes("fog") || c.includes("mist")) return "cloudy";
  return "cloudy";
}

function mapPeriods(periods: WeatherPeriod[]): WeatherPeriod[] {
  return dayParts.map((part, i) =>
    periods[i]
      ? { ...periods[i], time: part }
      : { time: part, temperature: 0, condition: "cloudy" }
  );
}

const WeatherCard = ({ weather }: WeatherCardProps) => {
  const getWeatherIcon = (condition: string, size = "h-6 w-6") => {
    const className = `${size} text-foreground`;
    switch (condition) {
      case "sunny":
        return <Sun className={className} />;
      case "cloudy":
        return <Cloud className={className} />;
      case "rainy":
        return <CloudRain className={className} />;
      case "snowy":
        return <Snowflake className={className} />;
      default:
        return <Cloud className={className} />;
    }
  };

  const renderWeatherPeriods = (periods: WeatherPeriod[], title: string) => {
    const fixedPeriods = mapPeriods(periods);
    return (
      <div className="space-y-3">
        <h4 className="font-medium text-sm text-muted-foreground">{title}</h4>
        <div className="grid grid-cols-4 gap-2">
          {fixedPeriods.map((period) => {
        const norm = normalizeCondition(period.condition);
        const color =
          norm === "sunny"
          ? "bg-yellow-100"
          : norm === "rainy"
          ? "bg-blue-100"
          : norm === "cloudy"
          ? "bg-gray-100"
          : "bg-white";
        return (
          <div
            key={period.time}
            className={`text-center p-2 rounded-lg ${color}`}
            >
            <p className="text-xs text-muted-foreground mb-1">{period.time}</p>
            <div className="flex justify-center mb-1">
              {getWeatherIcon(norm, "h-4 w-4")}
            </div>
            <p className="text-sm font-medium">{period.temperature}°C</p>
          </div>
        );
      })}
        </div>
      </div>
    );
  };
  
  return (
    <Card className="transition-all duration-300 hover:shadow-lg">
      <CardContent className="p-6">
        <div className="mb-6">
          <h3 className="font-semibold text-lg text-foreground mb-1">{weather.location}</h3>
          <p className="text-sm text-muted-foreground">Weather Forecast</p>
        </div>
        <div className="space-y-6">
          {renderWeatherPeriods(weather.today, "Today")}
          {renderWeatherPeriods(weather.tomorrow, "Tomorrow")}
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherCard;

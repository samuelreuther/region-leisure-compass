import { Cloud, Sun, CloudRain, Snowflake } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface WeatherData {
  location: string;
  temperature: number;
  condition: "sunny" | "cloudy" | "rainy" | "snowy";
  description: string;
  humidity: number;
  windSpeed: number;
}

interface WeatherCardProps {
  weather: WeatherData;
}

const WeatherCard = ({ weather }: WeatherCardProps) => {
  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case "sunny":
        return <Sun className="h-8 w-8 text-yellow-500" />;
      case "cloudy":
        return <Cloud className="h-8 w-8 text-gray-500" />;
      case "rainy":
        return <CloudRain className="h-8 w-8 text-blue-500" />;
      case "snowy":
        return <Snowflake className="h-8 w-8 text-blue-300" />;
      default:
        return <Sun className="h-8 w-8 text-yellow-500" />;
    }
  };

  const getBackgroundGradient = (condition: string) => {
    switch (condition) {
      case "sunny":
        return "bg-gradient-to-br from-yellow-100 to-orange-100";
      case "cloudy":
        return "bg-gradient-to-br from-gray-100 to-slate-200";
      case "rainy":
        return "bg-gradient-to-br from-blue-100 to-slate-200";
      case "snowy":
        return "bg-gradient-to-br from-blue-50 to-white";
      default:
        return "bg-gradient-to-br from-yellow-100 to-orange-100";
    }
  };

  return (
    <Card className={`transition-all duration-300 hover:shadow-lg ${getBackgroundGradient(weather.condition)}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg text-foreground">{weather.location}</h3>
            <p className="text-muted-foreground">{weather.description}</p>
          </div>
          {getWeatherIcon(weather.condition)}
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-foreground">{weather.temperature}°C</p>
            <p className="text-sm text-muted-foreground">Temperature</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">{weather.humidity}%</p>
            <p className="text-sm text-muted-foreground">Humidity</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">{weather.windSpeed} km/h</p>
            <p className="text-sm text-muted-foreground">Wind</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherCard;
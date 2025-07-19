import { Cloud, Sun, CloudRain, Snowflake } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface WeatherPeriod {
  time: string;
  temperature: number;
  condition: "sunny" | "cloudy" | "rainy" | "snowy";
  icon: React.ReactNode;
}

interface WeatherData {
  location: string;
  today: WeatherPeriod[];
  tomorrow: WeatherPeriod[];
}

interface WeatherCardProps {
  weather: WeatherData;
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
        return <Sun className={className} />;
    }
  };

  const renderWeatherPeriods = (periods: WeatherPeriod[], title: string) => (
    <div className="space-y-3">
      <h4 className="font-medium text-sm text-muted-foreground">{title}</h4>
      <div className="grid grid-cols-4 gap-2">
        {periods.map((period) => (
          <div key={period.time} className="text-center p-2 bg-background/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">{period.time}</p>
            <div className="flex justify-center mb-1">
              {getWeatherIcon(period.condition, "h-4 w-4")}
            </div>
            <p className="text-sm font-medium">{period.temperature}°C</p>
          </div>
        ))}
      </div>
    </div>
  );

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
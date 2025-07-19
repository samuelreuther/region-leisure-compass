import { ExternalLink, Database, MapPin, Music, Calendar, Wifi } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface DataSource {
  name: string;
  type: "API" | "Scraping" | "Manual" | "Coming Soon";
  description: string;
  coverage: string;
  dataTypes: string[];
  status: "active" | "planned" | "development";
  icon: React.ReactNode;
  url?: string;
}

const DataSourcesInfo = () => {
  const dataSources: DataSource[] = [
    {
      name: "Google Maps Places API",
      type: "API",
      description: "Restaurants, attractions, outdoor activities, opening hours, ratings, and reviews from Google's comprehensive database.",
      coverage: "Global",
      dataTypes: ["Restaurants", "Attractions", "Outdoor Activities", "Reviews"],
      status: "planned",
      icon: <MapPin className="h-5 w-5" />,
      url: "https://developers.google.com/maps/documentation/places"
    },
    {
      name: "Eventbrite API",
      type: "API", 
      description: "Local events, festivals, concerts, workshops, and community gatherings with ticketing information.",
      coverage: "Europe, North America",
      dataTypes: ["Events", "Festivals", "Concerts", "Workshops"],
      status: "planned",
      icon: <Calendar className="h-5 w-5" />
    },
    {
      name: "Songkick API",
      type: "API",
      description: "Live music events, concert listings, and artist tour dates across venues and festivals.",
      coverage: "Global",
      dataTypes: ["Concerts", "Live Music", "Festivals"],
      status: "planned", 
      icon: <Music className="h-5 w-5" />
    },
    {
      name: "Local Tourism APIs",
      type: "API",
      description: "Regional tourism boards like Baden-Württemberg Tourism, Switzerland Tourism, and Alsace Tourism data.",
      coverage: "Rhine Valley Region",
      dataTypes: ["Hiking Trails", "Cultural Sites", "Local Events"],
      status: "development",
      icon: <Database className="h-5 w-5" />
    },
    {
      name: "Weather API Integration",
      type: "API",
      description: "Real-time weather data to provide weather-appropriate activity recommendations.",
      coverage: "Global",
      dataTypes: ["Weather Forecasts", "Activity Suitability"],
      status: "development",
      icon: <Wifi className="h-5 w-5" />
    },
    {
      name: "Mock Data (Current)",
      type: "Manual",
      description: "Curated sample activities to demonstrate the app's functionality and user interface.",
      coverage: "Lörrach Region",
      dataTypes: ["Sample Activities", "Demo Content"],
      status: "active",
      icon: <Database className="h-5 w-5" />
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "development":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "planned":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Data Sources & Coverage
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Current and planned data sources for activity discovery across the region
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {dataSources.map((source, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {source.icon}
                  <div>
                    <h4 className="font-medium">{source.name}</h4>
                    <p className="text-sm text-muted-foreground">{source.type}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(source.status)}>
                  {source.status}
                </Badge>
              </div>
              
              <p className="text-sm">{source.description}</p>
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">
                  📍 {source.coverage}
                </Badge>
                {source.dataTypes.map((type) => (
                  <Badge key={type} variant="outline" className="text-xs">
                    {type}
                  </Badge>
                ))}
              </div>
              
              {source.url && (
                <Button variant="ghost" size="sm" asChild>
                  <a href={source.url} target="_blank" rel="noopener noreferrer">
                    Learn more <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">🚀 Coming Soon</h4>
          <p className="text-sm text-muted-foreground">
            Real-time integration with multiple APIs will provide comprehensive activity coverage including:
          </p>
          <ul className="text-sm text-muted-foreground mt-2 space-y-1">
            <li>• Live event feeds from Facebook Events, Meetup, and local event platforms</li>
            <li>• Real-time availability and booking for outdoor activities</li>
            <li>• Cross-border event discovery (Germany, Switzerland, France)</li>
            <li>• Community voting system for activity recommendations</li>
            <li>• Seasonal activity recommendations</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataSourcesInfo;
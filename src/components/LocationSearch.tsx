import { useState } from "react";
import { Search, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export type LocationData = {
  name: string;
  lat: number;
  lon: number;
};

interface LocationSearchProps {
  onLocationSelect: (location: LocationData) => void;
  currentLocation: LocationData;
}

const suggestions: LocationData[] = [
  { name: "Lörrach, Germany", lat: 47.6149, lon: 7.6647 },
  { name: "Basel, Switzerland", lat: 47.5596, lon: 7.5886 },
  { name: "Freiburg, Germany", lat: 47.9990, lon: 7.8421 },
];

const LocationSearch = ({ onLocationSelect, currentLocation }: LocationSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Geocoding-Funktion (wie vorher, OSM/Nominatim)
  async function geocode(query: string) {
    const q = encodeURIComponent(query);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=1`;
    const res = await fetch(url, { headers: { "User-Agent": "region-leisure-compass/1.0 (mail@example.com)" } });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.length) return null;
    return {
      name: data[0].display_name,
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
    } as LocationData;
  }

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      // Zuerst: Ist es ein bekannter Ort? (nutze Suggestions)
      const known = suggestions.find(l => 
        l.name.toLowerCase() === searchQuery.trim().toLowerCase()
      );
      if (known) {
        onLocationSelect(known);
        setSearchQuery("");
        return;
      }
      // Sonst: Geocode für beliebige Orte
      const geo = await geocode(searchQuery);
      if (geo) onLocationSelect(geo);
      setSearchQuery("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Enter your location (e.g., Lörrach, Basel...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch} variant="nature">
          Search
        </Button>
      </div>

      {currentLocation && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>Current location: {currentLocation}</span>
        </div>
      )}

      <Card className="p-4">
        <h4 className="font-medium mb-3">Popular regions</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {suggestions.map((location) => (
            <Button
              key={location}
              variant="ghost"
              size="sm"
              onClick={() => onLocationSelect(location)}
              className="justify-start text-left h-auto p-2"
            >
              {location}
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default LocationSearch;

import { useState } from "react";
import { Search, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface LocationSearchProps {
  onLocationSelect: (location: string) => void;
  currentLocation: string;
}

const LocationSearch = ({ onLocationSelect, currentLocation }: LocationSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions] = useState([
    "Lörrach, Germany",
    "Basel, Switzerland", 
    "Freiburg, Germany",
    "Strasbourg, France",
    "Colmar, France",
    "Baden-Baden, Germany"
  ]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onLocationSelect(searchQuery);
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
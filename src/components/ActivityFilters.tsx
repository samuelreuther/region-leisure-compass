import { Filter, Calendar, Users, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface FilterOptions {
  category: "all" | "outdoor" | "indoor";
  familyFriendly: boolean;
  maxDistance: number;
  priceRange: "free" | "budget" | "premium" | "all";
}

interface ActivityFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
}

const ActivityFilters = ({ filters, onFiltersChange }: ActivityFiltersProps) => {
  const updateFilter = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Category Filter */}
        <div>
          <h4 className="font-medium mb-3">Activity Type</h4>
          <div className="grid grid-cols-3 gap-2">
            {["all", "outdoor", "indoor"].map((category) => (
              <Button
                key={category}
                variant={filters.category === category ? "nature" : "outline"}
                size="sm"
                onClick={() => updateFilter("category", category)}
                className="capitalize"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Family Friendly */}
        <div>
          <h4 className="font-medium mb-3">Preferences</h4>
          <div className="space-y-2">
            <Button
              variant={filters.familyFriendly ? "nature" : "outline"}
              size="sm"
              onClick={() => updateFilter("familyFriendly", !filters.familyFriendly)}
              className="w-full justify-start"
            >
              <Users className="h-4 w-4 mr-2" />
              Family Friendly
            </Button>
          </div>
        </div>

        <Separator />

        {/* Distance */}
        <div>
          <h4 className="font-medium mb-3">Distance</h4>
          <div className="grid grid-cols-2 gap-2">
            {[10, 25, 50, 100].map((distance) => (
              <Button
                key={distance}
                variant={filters.maxDistance === distance ? "nature" : "outline"}
                size="sm"
                onClick={() => updateFilter("maxDistance", distance)}
              >
                <MapPin className="h-4 w-4 mr-1" />
                {distance}km
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Price Range */}
        <div>
          <h4 className="font-medium mb-3">Price Range</h4>
          <div className="space-y-2">
            {[
              { key: "free", label: "Free", badge: "€0" },
              { key: "budget", label: "Budget", badge: "€-€€" },
              { key: "premium", label: "Premium", badge: "€€€" },
              { key: "all", label: "All prices", badge: null }
            ].map((price) => (
              <div key={price.key} className="flex items-center justify-between">
                <Button
                  variant={filters.priceRange === price.key ? "nature" : "outline"}
                  size="sm"
                  onClick={() => updateFilter("priceRange", price.key)}
                  className="flex-1 justify-start"
                >
                  {price.label}
                </Button>
                {price.badge && (
                  <Badge variant="outline" className="ml-2">
                    {price.badge}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Active Filters Count */}
        <div className="pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {Object.values(filters).filter(v => v !== "all" && v !== false && v !== 100).length} filters active
            </span>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onFiltersChange({
                category: "all",
                familyFriendly: false,
                maxDistance: 100,
                priceRange: "all"
              })}
            >
              Clear all
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityFilters;
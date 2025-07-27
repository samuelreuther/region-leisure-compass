import { useState, useEffect } from "react";
import { MapPin, Compass, Calendar, Star, RefreshCw, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import WeatherCard from "@/components/WeatherCard";
import ActivityCard from "@/components/ActivityCard";
import LocationSearch, { LocationData } from "@/components/LocationSearch";
import ActivityFilters from "@/components/ActivityFilters";
import { DatePicker } from "@/components/DatePicker";
import { AuthButton } from "@/components/auth/AuthButton";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import heroImage from "@/assets/hero-background.jpg";
import { fetchWeather, WeatherData } from "@/integrations/weather";
import { fetchTicketmasterEvents, TicketmasterEvent } from "@/integrations/ticketmaster";
import { fetchEventbriteEvents, EventbriteEvent } from "@/integrations/eventbrite";

// ...dein Code für State wie gehabt...

export default function Index() {
  // ...dein useState & fetchWeather etc...

  // Eventbrite Events
  const [eventbriteEvents, setEventbriteEvents] = useState<EventbriteEvent[]>([]);
  const [loadingEB, setLoadingEB] = useState(false);

  useEffect(() => {
    setLoadingEB(true);
    fetchEventbriteEvents(
      currentLocation.lat,
      currentLocation.lon,
      selectedDate,
      filters.maxDistance
    )
      .then(setEventbriteEvents)
      .catch(() => setEventbriteEvents([]))
      .finally(() => setLoadingEB(false));
  }, [currentLocation, selectedDate, filters.maxDistance]);

  // Merged Items (aktivitäten + ticketmaster + eventbrite)
  const mergedItems = [
    ...activities.map(a => ({ ...a, __type: "activity" })),
    ...events.map(e => ({
      ...e,
      __type: "event",
      category: "indoor",
      familyFriendly: true,
      distance: e.distance || 0,
      title: e.name || e.title,
      url: e.url,
      venue: e.venue,
      city: e.city,
      start: e.start,
    })),
    ...eventbriteEvents.map(e => ({
      ...e,
      __type: "eventbrite",
      category: "indoor",
      familyFriendly: true,
      distance: e.distance || 0,
      title: e.name,
      url: e.url,
      venue: e.venue,
      city: e.city,
      start: e.start,
    })),
  ];

  const filteredItems = mergedItems.filter(item => {
    if (filters.category !== "all" && item.category !== filters.category) return false;
    if (filters.familyFriendly && !item.familyFriendly) return false;
    if (item.__type === "activity" && item.distance > filters.maxDistance) return false;
    return true;
  });

  // ...dein Restcode wie gehabt...

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section ... */}
      {/* ... */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Standort, Datum, Wetter ... */}
          {/* ... */}

          {/* Filter Sidebar + Mixed Grid */}
          <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <ActivityFilters filters={filters} onFiltersChange={setFilters} />
            </div>
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Star className="h-6 w-6 text-nature-orange" />
                  Activities & Events for {selectedDate ? selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                  }) : 'Selected Date'}
                </h2>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchAllActivities}
                    disabled={loadingActivities}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loadingActivities ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <span className="text-muted-foreground">
                    {filteredItems.length} items found
                  </span>
                </div>
              </div>
              {/* Mixed Grid */}
              {(loadingActivities || loadingEvents || loadingEB) ? (
                <p>Loading…</p>
              ) : filteredItems.length > 0 ? (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredItems.map(item =>
                    item.__type === "activity" ? (
                      <ActivityCard
                        key={item.id}
                        activity={item}
                        onVote={(activityId, type) => {
                          // Voting-Logik optional
                        }}
                      />
                    ) : (
                      <Card key={item.id}>
                        <CardContent>
                          <div className="flex items-center gap-2 mb-2">
                            <Music className="h-5 w-5 text-purple-700" />
                            <span className="font-bold text-lg">{item.title}</span>
                          </div>
                          <div>{item.venue}, {item.city}</div>
                          <div>{new Date(item.start).toLocaleString("de-DE")}</div>
                          {item.distance !== null && item.distance !== undefined && (
                            <div className="text-xs text-muted-foreground mb-1">
                              {item.distance.toFixed(1)} km away
                            </div>
                          )}
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline"
                          >
                            Zum Event
                          </a>
                        </CardContent>
                      </Card>
                    )
                  )}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold mb-2">No activities or events found</h3>
                    <p className="text-muted-foreground text-center">
                      Try adjusting your filters or search in a different location to discover more.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

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

async function fetchSupabaseActivities(location: LocationData, filters: any) {
  // TODO: Replace with your Supabase/Komoot fetch implementation
  return [];
}

export default function Index() {
  const [currentLocation, setCurrentLocation] = useState<LocationData>({
    name: "Lörrach, Germany",
    lat: 47.6149,
    lon: 7.6647,
  });
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [filters, setFilters] = useState({
    category: "all" as "all" | "outdoor" | "indoor",
    familyFriendly: false,
    maxDistance: 50,
    priceRange: "all" as "free" | "budget" | "premium" | "all"
  });

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);

  const [activities, setActivities] = useState<any[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  const [events, setEvents] = useState<TicketmasterEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    setLoadingWeather(true);
    fetchWeather(currentLocation.lat, currentLocation.lon)
      .then(setWeather)
      .catch(() => setWeather(null))
      .finally(() => setLoadingWeather(false));
  }, [currentLocation]);

  const fetchAllActivities = async () => {
    setLoadingActivities(true);
    try {
      const dbActivities = await fetchSupabaseActivities(currentLocation, filters);
      setActivities(dbActivities || []);
    } catch {
      setActivities([]);
    } finally {
      setLoadingActivities(false);
    }
  };
  useEffect(() => { fetchAllActivities(); }, [currentLocation, filters]);

  useEffect(() => {
    setLoadingEvents(true);
    fetchTicketmasterEvents(currentLocation.lat, currentLocation.lon, selectedDate)
      .then(setEvents)
      .catch(() => setEvents([]))
      .finally(() => setLoadingEvents(false));
  }, [currentLocation, selectedDate]);

  const mergedItems = [
    ...activities.map(a => ({ ...a, __type: "activity" })),
    ...events.map(e => ({
      ...e,
      __type: "event",
      category: "indoor", // Example: Default to indoor, change as needed per API
      familyFriendly: true,
      distance: e.distance || 0,
    })),
  ];

  const filteredItems = mergedItems.filter(item => {
    if (filters.category !== "all" && item.category !== filters.category) return false;
    if (filters.familyFriendly && !item.familyFriendly) return false;
    if (item.distance > filters.maxDistance) return false;
    return true;
  });

  const getSaturday = (addWeeks = 0) => {
    const today = new Date();
    const day = today.getDay();
    const saturday = new Date(today);
    saturday.setDate(today.getDate() + ((6 - day + 7) % 7) + 7 * addWeeks);
    return saturday;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
        </div>
        <div className="absolute top-6 right-6 z-10">
          <AuthButton />
        </div>
        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in">
            Discover Your
            <span className="block bg-gradient-to-r from-nature-blue to-nature-green bg-clip-text text-transparent">
              Regional Adventures
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto animate-fade-in">
            Find the perfect activities for your weekend, from outdoor adventures to cultural experiences - all tailored to the weather and your location.
          </p>
          <Button variant="hero" size="lg" className="animate-scale-in">
            <Compass className="mr-2 h-5 w-5" />
            Start Exploring
          </Button>
        </div>
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-float">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Standort, Datum, Wetter */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <MapPin className="h-6 w-6 text-nature-green" />
                Your Location
              </h2>
              <LocationSearch
                currentLocation={currentLocation}
                onLocationSelect={setCurrentLocation}
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Calendar className="h-6 w-6 text-nature-orange" />
                Select Date
              </h2>
              <DatePicker date={selectedDate} onDateChange={setSelectedDate} />
              <div className="mt-4 space-y-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedDate(new Date())} className="w-full">
                  Today
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedDate(new Date(Date.now() + 24 * 60 * 60 * 1000))} className="w-full">
                  Tomorrow
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedDate(getSaturday(0))} className="w-full">
                  This Weekend
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedDate(getSaturday(1))} className="w-full">
                  Next Weekend
                </Button>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Calendar className="h-6 w-6 text-nature-blue" />
                Weather Forecast
              </h2>
              {loadingWeather && <p>Lade Wetterdaten…</p>}
              {weather && <WeatherCard weather={weather} />}
              {!weather && !loadingWeather && <p>Konnte Wetterdaten nicht laden.</p>}
            </div>
          </div>

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
              {(loadingActivities || loadingEvents) ? (
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

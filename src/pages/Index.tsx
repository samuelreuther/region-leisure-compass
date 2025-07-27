import { useState, useEffect } from "react";
import { MapPin, Compass, Calendar, Star, Info, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import WeatherCard from "@/components/WeatherCard";
import ActivityCard from "@/components/ActivityCard";
import LocationSearch from "@/components/LocationSearch";
import ActivityFilters from "@/components/ActivityFilters";
import { DatePicker } from "@/components/DatePicker";
import DataSourcesInfo from "@/components/DataSourcesInfo";
import { AuthButton } from "@/components/auth/AuthButton";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import heroImage from "@/assets/hero-background.jpg";
import { fetchWeather, WeatherData } from "@/integrations/weather";
import { geocodeCity } from "@/integrations/geocode";
import { fetchLiveEvents, TicketmasterEvent } from "@/integrations/ticketmaster"; // <---

const Index = () => {
  const [currentLocation, setCurrentLocation] = useState("Lörrach, Germany");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [filters, setFilters] = useState({
    category: "all" as "all" | "outdoor" | "indoor",
    familyFriendly: false,
    maxDistance: 50,
    priceRange: "all" as "free" | "budget" | "premium" | "all"
  });
  const [activities, setActivities] = useState<any[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Wetterdaten (Echtzeit)
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);

  // Ticketmaster-Events State
  const [musicEvents, setMusicEvents] = useState<TicketmasterEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  useEffect(() => {
    async function updateWeather() {
      setLoadingWeather(true);
      try {
        const { lat, lon } = await geocodeCity(currentLocation);
        const data = await fetchWeather(lat, lon);
        setWeather(data);
      } catch (err) {
        setWeather(null);
      }
      setLoadingWeather(false);
    }
    updateWeather();
  }, [currentLocation]);

  // Musik-Events laden (lokal + datum)
  useEffect(() => {
    async function getMusicEvents() {
      setLoadingEvents(true);
      try {
        const { lat, lon } = await geocodeCity(currentLocation);
        const dateStr = selectedDate?.toISOString().split("T")[0];
        let all = await fetchLiveEvents(lat, lon, filters.maxDistance, 15);
        if (dateStr) {
          all = all.filter(ev => ev.start === dateStr);
        }
        setMusicEvents(all);
      } catch (e) {
        setMusicEvents([]);
      }
      setLoadingEvents(false);
    }
    getMusicEvents();
  }, [currentLocation, selectedDate, filters.maxDistance]);

  // Mock activities data mit Voting (wie gehabt)
  const mockActivities = [
    // ... (beliebig, wie vorher)
  ];

  // Fetch activities from Supabase and external sources
  const fetchAllActivities = async () => {
    setLoadingActivities(true);
    try {
      const { data: dbActivities, error } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      await supabase.functions.invoke('fetch-events', {
        body: { location: currentLocation, radius: filters.maxDistance }
      });

      await supabase.functions.invoke('fetch-komoot-activities', {
        body: { location: currentLocation, radius: filters.maxDistance }
      });

      await supabase.functions.invoke('fetch-places', {
        body: { location: currentLocation, radius: filters.maxDistance }
      });

      const { data: updatedActivities } = await supabase
        .from('activities')
        .select('*')
        .order('rating', { ascending: false });

      const allActivities = [...mockActivities, ...(updatedActivities || [])];
      setActivities(allActivities);

      toast({
        title: "Activities updated",
        description: `Found ${allActivities.length} activities in your area.`,
      });
    } catch (error) {
      setActivities(mockActivities);
      toast({
        title: "Using cached data",
        description: "Couldn't fetch latest activities, showing cached results.",
        variant: "destructive",
      });
    } finally {
      setLoadingActivities(false);
    }
  };

  useEffect(() => {
    fetchAllActivities();
  }, [currentLocation, filters.maxDistance]);

  const activitiesToFilter = activities.length > 0 ? activities : mockActivities;
  const filteredActivities = activitiesToFilter.filter(activity => {
    if (filters.category !== "all" && activity.category !== filters.category) return false;
    if (filters.familyFriendly && !activity.familyFriendly) return false;
    if (activity.distance > filters.maxDistance) return false;
    if (filters.priceRange !== "all") {
      const price = activity.price.toLowerCase();
      if (filters.priceRange === "free" && !price.includes("free")) return false;
      if (filters.priceRange === "budget" && (price.includes("free") || parseInt(price.replace(/\D/g, "")) > 30)) return false;
      if (filters.priceRange === "premium" && parseInt(price.replace(/\D/g, "")) < 40) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section ... */}
      {/* ... wie gehabt ... */}

      {/* Main Content */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Location, Date & Weather */}
          {/* ... wie gehabt ... */}

          {/* Activities Section */}
          {/* ... wie gehabt ... */}

          {/* Live Music Events Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span role="img" aria-label="music">🎵</span>
              Live Music Events in {currentLocation} am {selectedDate?.toLocaleDateString("de-DE")}
            </h2>
            {loadingEvents ? (
              <div>Lade Musik-Events…</div>
            ) : musicEvents.length === 0 ? (
              <div>Keine Live-Konzerte gefunden.</div>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {musicEvents.map(ev => (
                  <a
                    key={ev.id}
                    href={ev.url}
                    target="_blank"
                    rel="noopener"
                    className="block border rounded-xl p-4 bg-white shadow hover:shadow-lg transition"
                  >
                    {ev.image && (
                      <img src={ev.image} alt={ev.title} className="w-full h-32 object-cover rounded-lg mb-2" />
                    )}
                    <div className="font-semibold">{ev.title}</div>
                    <div className="text-sm text-gray-500">{ev.venue} – {ev.city}</div>
                    <div className="text-xs text-gray-400">{ev.start}</div>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Data Sources Information */}
          {/* ... wie gehabt ... */}
        </div>
      </section>
    </div>
  );
};

export default Index;

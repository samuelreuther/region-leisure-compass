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

  useEffect(() => {
    setLoadingWeather(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const data = await fetchWeather(pos.coords.latitude, pos.coords.longitude);
          setWeather(data);
        } catch (err) {
          setWeather(null);
        }
        setLoadingWeather(false);
      },
      () => setLoadingWeather(false)
    );
  }, []);

  // Mock activities data mit Voting
  const mockActivities = [
    {
      id: "1",
      title: "Rhine River SUP Tour",
      description: "Stand-up paddleboarding adventure along the scenic Rhine River with stunning views of the Black Forest.",
      category: "outdoor" as const,
      location: "Rheinfelden",
      distance: 12,
      duration: "3-4 hours",
      rating: 4.8,
      price: "€45",
      familyFriendly: true,
      weatherDependent: true,
      image: "/placeholder.svg",
      tags: ["Water Sports", "Adventure", "Scenic"],
      votes: { thumbsUp: 127, thumbsDown: 8 }
    },
    {
      id: "2", 
      title: "Vitra Design Museum",
      description: "Explore world-class design exhibitions in this iconic Frank Gehry building across the border in Weil am Rhein.",
      category: "indoor" as const,
      location: "Weil am Rhein",
      distance: 8,
      duration: "2-3 hours",
      rating: 4.6,
      price: "€16",
      familyFriendly: true,
      weatherDependent: false,
      image: "/placeholder.svg",
      tags: ["Culture", "Design", "Art"],
      votes: { thumbsUp: 89, thumbsDown: 12 }
    },
    {
      id: "3",
      title: "Black Forest Hiking Trail",
      description: "Family-friendly hiking trail through ancient forests with waterfalls and panoramic viewpoints.",
      category: "outdoor" as const,
      location: "Todtnau",
      distance: 35,
      duration: "Half day",
      rating: 4.9,
      price: "Free",
      familyFriendly: true,
      weatherDependent: true,
      image: "/placeholder.svg",
      tags: ["Hiking", "Nature", "Forest"],
      votes: { thumbsUp: 203, thumbsDown: 5 }
    },
    {
      id: "4",
      title: "Basel Jazz Festival",
      description: "Weekend jazz performances in the heart of Basel featuring local and international artists.",
      category: "indoor" as const,
      location: "Basel, Switzerland",
      distance: 15,
      duration: "Evening",
      rating: 4.7,
      price: "€35",
      familyFriendly: false,
      weatherDependent: false,
      image: "/placeholder.svg",
      tags: ["Music", "Culture", "Evening"],
      votes: { thumbsUp: 156, thumbsDown: 23 }
    },
    {
      id: "5",
      title: "Lake Schluchsee Swimming",
      description: "Crystal clear mountain lake perfect for swimming, with sandy beaches and mountain views.",
      category: "outdoor" as const,
      location: "Schluchsee",
      distance: 45,
      duration: "Full day",
      rating: 4.5,
      price: "€8",
      familyFriendly: true,
      weatherDependent: true,
      image: "/placeholder.svg",
      tags: ["Swimming", "Lake", "Beach"],
      votes: { thumbsUp: 98, thumbsDown: 7 }
    },
    {
      id: "6",
      title: "Europa-Park Indoor Areas",
      description: "Experience thrilling indoor attractions and shows at Germany's largest theme park.",
      category: "indoor" as const,
      location: "Rust",
      distance: 60,
      duration: "Full day",
      rating: 4.9,
      price: "€56",
      familyFriendly: true,
      weatherDependent: false,
      image: "/placeholder.svg",
      tags: ["Theme Park", "Family", "Adventure"],
      votes: { thumbsUp: 342, thumbsDown: 18 }
    }
  ];

  // Fetch activities from Supabase and external sources
  const fetchAllActivities = async () => {
    setLoadingActivities(true);
    try {
      // Fetch from database
      const { data: dbActivities, error } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch live events
      await supabase.functions.invoke('fetch-events', {
        body: { location: currentLocation, radius: filters.maxDistance }
      });

      // Fetch Komoot activities
      await supabase.functions.invoke('fetch-komoot-activities', {
        body: { location: currentLocation, radius: filters.maxDistance }
      });

      // Fetch places
      await supabase.functions.invoke('fetch-places', {
        body: { location: currentLocation, radius: filters.maxDistance }
      });

      // Refresh data after fetching new activities
      const { data: updatedActivities } = await supabase
        .from('activities')
        .select('*')
        .order('rating', { ascending: false });

      // Combine with mock data for now
      const allActivities = [...mockActivities, ...(updatedActivities || [])];
      setActivities(allActivities);

      toast({
        title: "Activities updated",
        description: `Found ${allActivities.length} activities in your area.`,
      });
    } catch (error) {
      console.error('Error fetching activities:', error);
      setActivities(mockActivities); // Fallback to mock data
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
          {/* Location, Date & Weather */}
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
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSelectedDate(new Date())}
                  className="w-full"
                >
                  Today
                </Button

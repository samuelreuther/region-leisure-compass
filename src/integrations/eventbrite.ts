export interface EventbriteEvent {
  id: string;
  name: string;
  description: string;
  url: string;
  start: string;
  end: string;
  city: string;
  venue: string;
  image: string | null;
  price: string | null;
  category: string | null;
  lat?: number;
  lon?: number;
  distance?: number;
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  // Fallback if any coordinate is missing or not a number
  if (
    typeof lat1 !== "number" ||
    typeof lon1 !== "number" ||
    typeof lat2 !== "number" ||
    typeof lon2 !== "number" ||
    isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)
  ) {
    return 100; // Fallback value (100km)
  }
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function fetchEventbriteEvents(
  lat: number,
  lon: number,
  date: Date,
  radiusKm: number
): Promise<EventbriteEvent[]> {
  const token = import.meta.env.VITE_EVENTBRITE_KEY;
  if (!token) throw new Error("No Eventbrite API token found");

  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const startStr = encodeURIComponent(start.toISOString());
  const endStr = encodeURIComponent(end.toISOString());

  const url = `https://www.eventbriteapi.com/v3/events/search/?location.latitude=${lat}&location.longitude=${lon}&location.within=${radiusKm}km&start_date.range_start=${startStr}&start_date.range_end=${endStr}&expand=venue,category,logo&sort_by=date`;

  console.log("Eventbrite URL:", url);
  console.log("Eventbrite API token:", token);
  
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch Eventbrite events");
  }
  const data = await response.json();
  // Transformiere die Events für dein Frontend
  return (data.events || []).map((ev: any) => ({
    id: ev.id,
    name: ev.name.text,
    title: ev.name.text,
    url: ev.url,
    start: ev.start.local || ev.start.utc,
    venue: ev.venue?.name || "",
    city: ev.venue?.address?.city || "",
    logo: ev.logo?.url,
    distance: ev.distance ?? null,
  }));
}

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
  startDate: Date,
  radiusKm = 50,
  maxResults = 12
): Promise<EventbriteEvent[]> {
  const token = import.meta.env.VITE_EVENTBRITE_KEY;
  if (!token) throw new Error("No Eventbrite API token set!");

  const startStr = startDate.toISOString().slice(0, 10) + "T00:00:00";
  const end = new Date(startDate);
  end.setDate(end.getDate() + 1);
  const endStr = end.toISOString().slice(0, 10) + "T23:59:59";

  const url = `https://www.eventbriteapi.com/v3/events/search/?location.latitude=${lat}&location.longitude=${lon}&location.within=${radiusKm}km&start_date.range_start=${startStr}Z&start_date.range_end=${endStr}Z&expand=venue,category,logo&sort_by=date&token=${token}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch Eventbrite events");
  const data = await res.json();

  return (data.events || []).slice(0, maxResults).map((e: any) => {
    const venueLat = parseFloat(e.venue?.address?.latitude) || 0;
    const venueLon = parseFloat(e.venue?.address?.longitude) || 0;
    const distance =
      venueLat && venueLon
        ? haversine(lat, lon, venueLat, venueLon)
        : null;
    return {
      id: e.id,
      name: e.name.text,
      description: e.description?.text || "",
      url: e.url,
      start: e.start.local,
      end: e.end.local,
      city: e.venue?.address?.city || "",
      venue: e.venue?.name || "",
      image: e.logo?.url || null,
      price: e.is_free ? "Free" : null,
      category: e.category?.name || null,
      lat: venueLat,
      lon: venueLon,
      distance,
    };
  });
}

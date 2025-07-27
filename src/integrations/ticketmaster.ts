const TICKETMASTER_API_KEY = import.meta.env.VITE_TICKETMASTER_KEY;

export type TicketmasterEvent = {
  id: string;
  title: string;
  venue: string;
  city: string;
  start: string;
  url: string;
  image: string;
};

/**
 * Lädt Events (alle Typen!) für Koordinaten & Datum
 */
export async function fetchTicketmasterEvents(
  lat: number,
  lon: number,
  date: Date,
  radiusKm = 100
): Promise<TicketmasterEvent[]> {
  // Zeitraum berechnen (ein Tag)
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const start = `${y}-${m}-${d}T00:00:00Z`;
  const end = `${y}-${m}-${d}T23:59:59Z`;
  const radius = filters.maxDistance;

  const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${TICKETMASTER_API_KEY}&latlong=${lat},${lon}&radius=${radius}&startDateTime=${start}&endDateTime=${end}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  if (!data._embedded?.events) return [];
  return data._embedded.events.map((e: any) => ({
    id: e.id,
    title: e.name,
    venue: e._embedded?.venues?.[0]?.name || "",
    city: e._embedded?.venues?.[0]?.city?.name || "",
    start: e.dates?.start?.dateTime || "",
    url: e.url,
    image: e.images?.[0]?.url || "",
  }));
}

// src/integrations/ticketmaster.ts

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
 * Ruft Musik-Events (Concerts) im Umkreis der Koordinaten ab
 * @param lat Latitude
 * @param lon Longitude
 * @param radius km
 * @param size max results (default 10)
 * @returns TicketmasterEvent[]
 */
export async function fetchLiveEvents(
  lat: number, 
  lon: number, 
  radius: number = 50, 
  size: number = 10
): Promise<TicketmasterEvent[]> {
  const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${TICKETMASTER_API_KEY}&latlong=${lat},${lon}&radius=${radius}&classificationName=music&size=${size}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Ticketmaster API fetch failed");

  const data = await res.json();
  if (!data._embedded?.events) return [];
  return data._embedded.events.map((e: any) => ({
    id: e.id,
    title: e.name,
    venue: e._embedded?.venues?.[0]?.name || "",
    city: e._embedded?.venues?.[0]?.city?.name || "",
    start: e.dates?.start?.localDate || "",
    url: e.url,
    image: e.images?.[0]?.url || "",
  }));
}

/**
 * Wrapper: Suche Events für einen Ort (location) und Tag (date).
 * Verwendet Dummy-Koordinaten für Städte (verbessere ggf. mit echtem Geocoding).
 */
export async function fetchTicketmasterEvents(
  location: string,
  date: Date
): Promise<TicketmasterEvent[]> {
  // Dummy-Koordinaten (z.B. Lörrach, Berlin, Basel)
  let lat = 47.6149, lon = 7.6647; // Lörrach
  if (location.toLowerCase().includes("berlin")) { lat = 52.52; lon = 13.405; }
  if (location.toLowerCase().includes("basel")) { lat = 47.5596; lon = 7.5886; }
  if (location.toLowerCase().includes("zurich")) { lat = 47.3769; lon = 8.5417; }

  // Filter für Tageszeitraum (Ticketmaster kann Start- und Enddatum)
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const start = `${y}-${m}-${d}T00:00:00Z`;
  const end = `${y}-${m}-${d}T23:59:59Z`;

  const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${TICKETMASTER_API_KEY}&latlong=${lat},${lon}&radius=50&classificationName=music&startDateTime=${start}&endDateTime=${end}`;
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

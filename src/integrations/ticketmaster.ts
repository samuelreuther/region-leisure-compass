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

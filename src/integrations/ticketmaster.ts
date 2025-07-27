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
 * Loads all types of events for coordinates & date
 */
export async function fetchTicketmasterEvents(
  lat: number,
  lon: number,
  start: Date, 
  end: Date,
  radiusKm = 100
): Promise<TicketmasterEvent[]> {
  // Format start and end to YYYY-MM-DDTHH:MM:SSZ
  const format = (d: Date, h: number, m: number, s: number, ms: number) => {
    const dt = new Date(d);
    dt.setHours(h, m, s, ms);
    return dt.toISOString().slice(0, 19) + "Z";
  };

  const startIso = format(start, 0, 0, 0, 0);
  const endIso   = format(end, 23, 59, 59, 999);

  const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${TICKETMASTER_API_KEY}&latlong=${lat},${lon}&radius=${radiusKm}&startDateTime=${startIso}&endDateTime=${endIso}`;

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


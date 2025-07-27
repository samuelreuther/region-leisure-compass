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
  if (!res.ok) throw new Erro

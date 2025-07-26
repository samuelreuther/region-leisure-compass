export async function geocodeCity(city: string): Promise<{ lat: number, lon: number }> {
  const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`);
  const data = await res.json();
  if (!data[0]) throw new Error("Stadt nicht gefunden");
  return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
}

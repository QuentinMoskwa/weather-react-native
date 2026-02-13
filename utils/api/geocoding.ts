export type GeocodingResult = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string
};

export async function getCoordinates(
  city: string,
): Promise<GeocodingResult | null> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    city,
  )}&count=1&language=fr&format=json`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.results || data.results.length === 0) {
    console.error("pas de réponse de l'api geocoding")
    return null;
  }

  const result = data.results[0];

  return {
    id: result.id,
    name: result.name,
    latitude: result.latitude,
    longitude: result.longitude,
    country: result.country
  };
}

export async function searchCities(
  query: string,
  limit = 5,
): Promise<GeocodingResult[]> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    query,
  )}&count=${limit}&language=fr&format=json`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.results || data.results.length === 0) {
    return [];
  }

  return data.results.map((result: GeocodingResult) => ({
    id: result.id,
    name: result.name,
    latitude: result.latitude,
    longitude: result.longitude,
    country: result.country
  }));
}

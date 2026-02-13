import AsyncStorage from "@react-native-async-storage/async-storage";

const FAVORITES_KEY = "@weather_favorites";

export interface FavoriteCity {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

export async function getFavorites(): Promise<FavoriteCity[]> {
  try {
    const favoritesJson = await AsyncStorage.getItem(FAVORITES_KEY);
    return favoritesJson ? JSON.parse(favoritesJson) : [];
  } catch (error) {
    console.error("Error loading favorites:", error);
    return [];
  }
}

export async function addFavorite(city: FavoriteCity): Promise<void> {
  try {
    const favorites = await getFavorites();
    const exists = favorites.some(
      (fav) => fav.name === city.name && fav.country === city.country,
    );

    if (!exists) {
      favorites.push(city);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    }
  } catch (error) {
    console.error("Error adding favorite:", error);
  }
}

export async function removeFavorite(cityName: string): Promise<void> {
  try {
    const favorites = await getFavorites();
    const filtered = favorites.filter((fav) => fav.name !== cityName);
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Error removing favorite:", error);
  }
}

export async function isFavorite(cityName: string): Promise<boolean> {
  try {
    const favorites = await getFavorites();
    return favorites.some((fav) => fav.name === cityName);
  } catch (error) {
    console.error("Error checking favorite:", error);
    return false;
  }
}

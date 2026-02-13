import { Image } from 'expo-image';
import { Platform, StyleSheet, ActivityIndicator, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { getCoordinates, GeocodingResult } from '@/utils/api/geocoding';
import { getWeatherForecast, WeatherData } from '@/utils/api/weatherforecast';
import { LinearGradient } from 'expo-linear-gradient';

export default function TabTwoScreen() {
  const { city } = useLocalSearchParams<{ city?: string }>();
  const [cityData, setCityData] = useState<GeocodingResult | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (city) {
      fetchCityData(city as string);
    }
  }, [city]);

  const fetchCityData = async (cityName: string) => {
    setLoading(true);
    try {
      const coords = await getCoordinates(cityName);
      setCityData(coords);
      
      if (coords) {
        const weather = await getWeatherForecast(coords.latitude, coords.longitude);
        setWeatherData(weather);
      }
    } catch (error) {
      console.error('Error fetching city data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (city && loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <ThemedText>Chargement des données...</ThemedText>
      </ThemedView>
    );
  }

  if (city && cityData) {
    return (
      <LinearGradient
            colors={['#354696', '#3e1963']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.background}
          >
        <View style={styles.container}>
          <View>
            <ThemedText type="title">
              {cityData.name}
            </ThemedText>
          </View>

          <View style={styles.infoSection}>
            <ThemedText type="subtitle">Informations</ThemedText>
            <ThemedText>Pays: {cityData.country}</ThemedText>
            <ThemedText>Latitude: {cityData.latitude.toFixed(4)}°</ThemedText>
            <ThemedText>Longitude: {cityData.longitude.toFixed(4)}°</ThemedText>
          </View>

          {weatherData && weatherData.hourly && (
            <View style={styles.infoSection}>
              <ThemedText type="subtitle">Météo</ThemedText>
              <ThemedText>
                Température: {Math.round(weatherData.hourly.temperature_2m?.[0] ?? 0)}°C
              </ThemedText>
            </View>
          )}
        </View>
      </LinearGradient>
    );
  }
}


const styles = StyleSheet.create({
  background: {
    backgroundImage : ' linear-gradient(135deg, #354696 0%, #3e1963 100%)',
    display: 'flex',
    flex: 1,
  },
  container: {
    backgroundColor: '#7d7d7d4e',
    display: 'flex',
    flex: 1,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop : 50,
    marginRight : 20,
    marginLeft : 20,
    marginBottom : 50,
    paddingTop: 50,
    paddingRight: 25,
    paddingBottom: 50,
    paddingLeft: 25,
    gap: 24,
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  infoSection: {
    gap: 8,
    marginBottom: 16,
  },
});

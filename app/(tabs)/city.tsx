import { Image } from 'expo-image';
import { Platform, StyleSheet, ActivityIndicator, View, Pressable } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SearchBar } from '@/components/SearchBar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { getCoordinates, GeocodingResult, searchCities } from '@/utils/api/geocoding';
import { getWeatherForecast, WeatherData } from '@/utils/api/weatherforecast';
import { LinearGradient } from 'expo-linear-gradient';
import { getWeatherIcon } from '@/utils/weatherCodeToIcon';
import { addFavorite, removeFavorite, isFavorite } from '@/utils/favorites';

export default function CityScreen() {
  const router = useRouter();
  const { city } = useLocalSearchParams<{ city?: string }>();
  const [cityData, setCityData] = useState<GeocodingResult | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchCity, setSearchCity] = useState('');
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    if (city) {
      fetchCityData(city as string);
    }
  }, [city]);

  useEffect(() => {
    const query = searchCity.trim();

    if (query.length < 3) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchCities(query, 5);
        setSuggestions(results);
        setShowDropdown(true);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchCity]);

  const handleSearch = () => {
    if (searchCity.trim()) {
      router.push({
        pathname: '/city',
        params: { city: searchCity.trim() }
      });
      setShowDropdown(false);
    }
  };

  const handleSelectCity = (cityName: string) => {
    setSearchCity(cityName);
    setShowDropdown(false);
    router.push({
      pathname: '/city',
      params: { city: cityName }
    });
  };

  const fetchCityData = async (cityName: string) => {
    setLoading(true);
    try {
      const coords = await getCoordinates(cityName);
      setCityData(coords);
      
      if (coords) {
        const weather = await getWeatherForecast(coords.latitude, coords.longitude);
        setWeatherData(weather);
        const isFav = await isFavorite(coords.name);
        setFavorite(isFav);
      }
    } catch (error) {
      console.error('Error fetching city data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    if (!cityData) return;
    
    if (favorite) {
      await removeFavorite(cityData.name);
      setFavorite(false);
    } else {
      await addFavorite({
        name: cityData.name,
        country: cityData.country,
        latitude: cityData.latitude,
        longitude: cityData.longitude,
      });
      setFavorite(true);
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
    // tableau prévi
    const next7Days = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i + 1);
      return date.toLocaleDateString('fr-FR', { month: 'numeric', day: 'numeric' });
    });

    return (
      <LinearGradient
        colors={['#0593ff', '#03b6aa']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      >
        <View style={styles.container}>
          <View style={styles.topBar}>
            <View style={styles.titleContainer}>
              <ThemedText type="title" style={styles.titreVille}>
                {cityData.name}
              </ThemedText>
              <Pressable onPress={toggleFavorite} style={styles.starButton}>
                <ThemedText style={styles.starIcon}>{favorite ? '★' : '☆'}</ThemedText>
              </Pressable>
            </View>
            <SearchBar
              searchCity={searchCity}
              onSearchChange={setSearchCity}
              onSearch={handleSearch}
              suggestions={suggestions}
              isSearching={isSearching}
              showDropdown={showDropdown}
              onDropdownToggle={setShowDropdown}
              onSelectCity={handleSelectCity}
            />
          </View>

          {weatherData && weatherData.hourly && (
            <View>
              {/* <Image 
                    source={getWeatherIcon(weatherData.daily?.weather_code[0] ?? 0)} 
                    style={{ width: 64, height: 64 }} 
                  /> */}
              <ThemedText style={styles.tempSection}>
                {Math.round(weatherData.hourly.temperature_2m?.[0] ?? 0)}°C
              </ThemedText>
            </View>
          )}
          <View style={styles.previsionSection}>

            <View style={styles.tableRow}>
              <ThemedText type="subtitle" style={styles.tableCell}>Date</ThemedText>
              <ThemedText type="subtitle" style={styles.tableCell}>Température</ThemedText>
              <ThemedText type="subtitle" style={styles.tableCell}>Météo</ThemedText>
            </View>
            
            {weatherData?.daily && next7Days.map((date, idx) => (
              <View key={idx} style={styles.tableRow}>
                <ThemedText style={styles.tableCell}>{date}</ThemedText>
                <ThemedText style={styles.tableCell}>
                  {Math.round(weatherData.daily?.temperature_2m_min[idx + 1] ?? 0)}° / {Math.round(weatherData.daily?.temperature_2m_max[idx + 1] ?? 0)}°
                </ThemedText>
                <View style={styles.tableCell}>
                  <Image 
                    source={getWeatherIcon(weatherData.daily?.weather_code[idx + 1] ?? 0)} 
                    style={{ width: 32, height: 32 }} 
                  />
                </View>
              </View>
            ))}
          </View>
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
    // backgroundColor: '#7d7d7d4e',
    display: 'flex',
    // flex: 1,
    // borderRadius: 16,
    // height: '100%',
    // justifyContent: 'space-between',
    alignItems: 'center',
    marginTop : 50,
    marginRight : 20,
    marginLeft : 20,
    // marginBottom : 50,
    // paddingTop: 50,
    // paddingRight: 25,
    // paddingBottom: 50,
    // paddingLeft: 25,
    // gap: 24,
  },
  topBar: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    marginBottom: '30%',
  },
  titreVille:{
    fontSize:20
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  starIcon: {
    fontSize: 28,
    color: '#FFD700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  tempSection: {
    fontSize: 100,
    color: '#fff',
    lineHeight: 100,
    marginBottom: '20%',
  },
  previsionSection: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    paddingRight: 10,
    paddingLeft: 10,
    gap: 8,
  },
  tableRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
});


import { StyleSheet, View, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SearchBar } from '@/components/SearchBar';
import { getCoordinates, GeocodingResult, searchCities } from '@/utils/api/geocoding';
import { getFavorites, FavoriteCity } from '@/utils/favorites';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

export default function HomeScreen() {
  const router = useRouter();
  const [searchCity, setSearchCity] = useState('');
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteCity[]>([]);

  const loadFavorites = async () => {
    const favs = await getFavorites();
    setFavorites(favs);
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  useFocusEffect(() => {
    loadFavorites();
  });

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
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchCity]);

  const handleSearch = () => {
    setShowDropdown(false);
    if (searchCity.trim()) {
      router.push({
        pathname: '/city',
        params: { city: searchCity.trim() }
      });
    }
  };

  const handleSelectCity = (cityName: string) => {
    setShowDropdown(false);
    setSearchCity(cityName);
    router.push({
      pathname: '/city',
      params: { city: cityName }
    });
  };

  return (
    <LinearGradient
      colors={['#0593ff', '#03b6aa']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.background}
    >
      <ThemedView style={styles.container}>

        <ThemedText type="title" style={styles.title}>
          Météo
        </ThemedText>

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

        <View style={styles.section}>
          <ThemedText type="subtitle">Villes favorites</ThemedText>

          {favorites.length === 0 ? (
            <ThemedText style={styles.noFavorites}>
              Aucunes villes favorite.
            </ThemedText>
          ) : (
            favorites.map((fav) => {
              return (
                <Pressable
                  key={fav.name}
                  style={styles.city}
                  onPress={() => router.push({
                    pathname: '/city',
                    params: { city: fav.name }
                  })}
                >
                  <View style={styles.cityInfo}>
                    <ThemedText>{fav.name}</ThemedText>
                    <ThemedText style={styles.coordinates}>
                      {fav.country}
                    </ThemedText>
                  </View>
                </Pressable>
              );
            })
          )}
        </View>

      </ThemedView>
    </LinearGradient>
  );
}



const styles = StyleSheet.create({
  background: {
    zIndex: -1,
    backgroundImage : ' linear-gradient(135deg, #354696 0%, #3e1963 100%)',
    display: 'flex',
    flex: 1,
  },
  container: {
    backgroundColor: '#7d7d7d4e',
    display: 'flex',
    flex: 1,
    borderRadius: 16,
    alignItems: 'stretch',
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
  title: {
    textAlign: 'center',
  },
  section: {
    gap: 8,
  },
  city: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#7d7d7d4e',
    padding: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  cityInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  coordinates: {
    fontSize: 12,
    opacity: 0.7,
  },
  infoCity: {
    display: 'flex',
    alignContent: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  noFavorites: {
    textAlign: 'center',
    opacity: 0.7,
    padding: 20,
  }
});

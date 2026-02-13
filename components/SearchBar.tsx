import { StyleSheet, View, TextInput, Pressable, ActivityIndicator, Modal, TouchableWithoutFeedback } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { GeocodingResult } from '@/utils/api/geocoding';

interface SearchBarProps {
  searchCity: string;
  onSearchChange: (text: string) => void;
  onSearch: () => void;
  suggestions: GeocodingResult[];
  isSearching: boolean;
  showDropdown: boolean;
  onDropdownToggle: (show: boolean) => void;
  onSelectCity: (cityName: string) => void;
}

export function SearchBar({
  searchCity,
  onSearchChange,
  onSearch,
  suggestions,
  isSearching,
  showDropdown,
  onDropdownToggle,
  onSelectCity,
}: SearchBarProps) {
  return (
    <>
      {showDropdown && (
        <TouchableWithoutFeedback onPress={() => onDropdownToggle(false)}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
      )}
      <View style={styles.section}>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Entrez une ville..."
            placeholderTextColor="#ddd"
            style={styles.input}
            value={searchCity}
            onChangeText={onSearchChange}
            onSubmitEditing={onSearch}
            returnKeyType="search"
            onFocus={() => onDropdownToggle(!!suggestions.length)}
          />
          {showDropdown && (
            <Pressable 
              style={styles.closeButton}
              onPress={() => onDropdownToggle(false)}
            >
              <ThemedText style={styles.closeButtonText}>×</ThemedText>
            </Pressable>
          )}
        </View>
        {showDropdown && (
          <View style={styles.dropdown}>
            {isSearching && (
              <View style={styles.dropdownItem}>
                <ActivityIndicator size="small" color="#ffffff" />
                <ThemedText style={styles.dropdownText}>Recherche...</ThemedText>
              </View>
            )}
            {!isSearching && suggestions.length === 0 && (
              <View style={styles.dropdownItem}>
                <ThemedText style={styles.dropdownText}>Aucun résultat</ThemedText>
              </View>
            )}
            {!isSearching && suggestions.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => onSelectCity(item.name)}
                style={styles.dropdownItem}
              >
                <ThemedText style={styles.dropdownText}>{item.name}</ThemedText>
                <ThemedText style={styles.dropdownSubtext}>{item.country}</ThemedText>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  section: {
    gap: 8,
    position: 'relative',
    zIndex: 1000,
    width: '100%',
  },
  inputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    paddingRight: 40,
    fontSize: 16,
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    right: 8,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    backgroundColor: '#2b2b3d',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4b4b5f',
    paddingVertical: 6,
    marginTop: 4,
    maxHeight: 300,
    zIndex: 1001,
    minWidth: 300,
  },
  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  dropdownText: {
    color: '#ffffff',
  },
  dropdownSubtext: {
    color: '#cfcfe6',
    fontSize: 12,
    opacity: 0.8,
  },
});

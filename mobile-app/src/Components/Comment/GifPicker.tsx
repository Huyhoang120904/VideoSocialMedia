import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GifItem, fetchTrendingGifs, searchGifs } from "../../Services/GiphyService";

interface GifPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (gifUrl: string) => void;
}

const GifPicker: React.FC<GifPickerProps> = ({ visible, onClose, onSelect }) => {
  const [query, setQuery] = useState("");
  const [gifs, setGifs] = useState<GifItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const translateY = useRef(new Animated.Value(400)).current;

  useEffect(() => {
    if (visible) {
      setQuery("");
      loadTrending();
      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }).start();
    } else {
      translateY.setValue(400);
    }
  }, [visible, translateY]);

  const loadTrending = async () => {
    try {
      setLoading(true);
      setError(null);
      const trending = await fetchTrendingGifs();
      setGifs(trending);
    } catch (err: any) {
      setError(err.message || "Không thể tải GIF trending");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    const trimmed = query.trim();
    if (!trimmed) {
      loadTrending();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const results = await searchGifs(trimmed);
      setGifs(results);
    } catch (err: any) {
      setError(err.message || "Không thể tìm GIF");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (gifUrl: string) => {
    onSelect(gifUrl);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>GIF</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchRow}>
            <Ionicons name="search" size={18} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm GIF"
              placeholderTextColor="#999"
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
              <Text style={styles.searchButtonText}>Tìm</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#fff" />
            </View>
          ) : error ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : (
            <FlatList
              data={gifs}
              keyExtractor={(item) => item.id}
              numColumns={3}
              columnWrapperStyle={{ justifyContent: "space-between" }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleSelect(item.url)}
                  style={styles.gifItem}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{ uri: item.previewUrl || item.url }}
                    style={styles.gifImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              )}
            />
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#111",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 16,
    maxHeight: "80%",
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sheetTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F2937",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 8,
    color: "#fff",
    fontSize: 14,
  },
  searchButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "#FE2C55",
  },
  searchButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  loadingContainer: {
    paddingVertical: 32,
    alignItems: "center",
  },
  errorText: {
    color: "#f87171",
  },
  gifItem: {
    width: "32%",
    aspectRatio: 1,
    marginBottom: 8,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#1f1f1f",
  },
  gifImage: {
    width: "100%",
    height: "100%",
  },
});

export default GifPicker;


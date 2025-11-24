import { Platform } from "react-native";

export interface GifItem {
  id: string;
  url: string;
  previewUrl?: string;
  title?: string;
}

const API_KEY = process.env.EXPO_PUBLIC_GIPHY_API_KEY;
const BASE_URL = "https://api.giphy.com/v1/gifs";

const ensureApiKey = () => {
  if (!API_KEY) {
    const platform = Platform.OS === "web" ? "web" : "native";
    console.warn(
      `[GiphyService] Missing EXPO_PUBLIC_GIPHY_API_KEY in .env (${platform}).`
    );
  }
};

const normalizeGifResponse = (items: any[]): GifItem[] => {
  return items
    .map((item) => {
      const downsized = item.images?.downsized?.url;
      if (!downsized) return null;
      return {
        id: item.id,
        url: downsized,
        previewUrl:
          item.images?.preview_gif?.url ||
          item.images?.fixed_width_small_still?.url ||
          downsized,
        title: item.title,
      };
    })
    .filter((gif): gif is GifItem => !!gif);
};

export const searchGifs = async (
  query: string,
  limit: number = 24
): Promise<GifItem[]> => {
  ensureApiKey();
  if (!API_KEY) return [];

  const url = `${BASE_URL}/search?api_key=${API_KEY}&q=${encodeURIComponent(
    query
  )}&limit=${limit}&rating=pg-13`;
  const response = await fetch(url);
  const data = await response.json();
  return normalizeGifResponse(data.data || []);
};

export const fetchTrendingGifs = async (
  limit: number = 24
): Promise<GifItem[]> => {
  ensureApiKey();
  if (!API_KEY) return [];

  const url = `${BASE_URL}/trending?api_key=${API_KEY}&limit=${limit}&rating=pg-13`;
  const response = await fetch(url);
  const data = await response.json();
  return normalizeGifResponse(data.data || []);
};


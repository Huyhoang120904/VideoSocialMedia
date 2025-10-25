const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://172.20.82.76:8082/api/v1";

/**
 * Constructs the avatar URL using the new endpoint pattern:
 * /api/v1/files/{userDetailId}/{filename}
 */
export const getAvatarUrl = (
  userDetailId: string,
  fileName?: string
): string | null => {
  if (!fileName) {
    return null;
  }
  return `${API_URL}/files/${userDetailId}/${fileName}`;
};

/**
 * Gets the correct video URL for the current platform
 * Handles localhost URLs by replacing with configured API host
 */
export const getVideoUrl = (originalUrl: string): string => {
  if (!originalUrl) return '';
  
  // If it's already a proper URL, check if it needs host replacement
  if (originalUrl.startsWith('http://') || originalUrl.startsWith('https://')) {
    // Replace localhost with configured API host
    if (originalUrl.includes('localhost:8082')) {
      const apiHost = API_URL.replace('/api/v1', '');
      return originalUrl.replace('localhost:8082', apiHost.replace('http://', ''));
    }
    return originalUrl;
  }
  
  // If it's a relative path, construct full URL using configured API_URL
  return `${API_URL}${originalUrl.startsWith('/') ? '' : '/'}${originalUrl}`;
};
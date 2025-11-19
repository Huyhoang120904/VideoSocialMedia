const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://192.168.100.57:8082/api/v1";

/**
 * Constructs the avatar URL using the new endpoint pattern:
 * /api/v1/files/{userDetailId}/{filename}
 */
export const getAvatarUrl = (
  userDetailId: string,
  fileName?: string
): string | null => {
  console.log(`avt: ${API_URL}/files/${userDetailId}/${fileName}`);

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


  try {
    // If it's already a proper URL, check if it needs host replacement
    if (originalUrl.startsWith('http://') || originalUrl.startsWith('https://')) {
      // Replace old host with configured API host
      const currentHost = API_URL.replace('/api/v1', '').replace('http://', '').replace('https://', '');
      
      if (originalUrl.includes('172.20.82.76:8082') || 
          originalUrl.includes('192.168.239.147:8082') ||
          originalUrl.includes('localhost:8082')) {
        // Extract the protocol and the rest of the URL
        const protocol = originalUrl.startsWith('https://') ? 'https://' : 'http://';
        const oldHost = originalUrl.match(/(172\.20\.82\.76:8082|192\.168\.239\.147:8082|localhost:8082)/)?.[0];
        if (oldHost) {
          const newUrl = originalUrl.replace(oldHost, currentHost);
          console.log('Replaced URL:', newUrl);
          return newUrl;
        }
      }
      return originalUrl;
    }

    // If it's a relative path, construct full URL using configured API_URL
    return `${API_URL}${originalUrl.startsWith('/') ? '' : '/'}${originalUrl}`;
  } catch (error) {
    console.error('Error processing video URL:', error);
    return originalUrl; // Return original URL as fallback
  }
};

/**
 * Gets the correct thumbnail URL for the current platform
 * Handles URL replacement similar to getVideoUrl
 */
export const getThumbnailUrl = (originalUrl: string): string => {
  if (!originalUrl) return '';

  console.log('Original Thumbnail URL:', originalUrl);

  try {
    // If it's already a proper URL, check if it needs host replacement
    if (originalUrl.startsWith('http://') || originalUrl.startsWith('https://')) {
      // Replace old host with configured API host
      const currentHost = API_URL.replace('/api/v1', '').replace('http://', '').replace('https://', '');
      
      if (originalUrl.includes('172.20.82.76:8082') || 
          originalUrl.includes('192.168.239.147:8082') ||
          originalUrl.includes('localhost:8082')) {
        const oldHost = originalUrl.match(/(172\.20\.82\.76:8082|192\.168\.239\.147:8082|localhost:8082)/)?.[0];
        if (oldHost) {
          const newUrl = originalUrl.replace(oldHost, currentHost);
          console.log('Replaced Thumbnail URL:', newUrl);
          return newUrl;
        }
      }
      return originalUrl;
    }

    // If it's a relative path, construct full URL using configured API_URL
    return `${API_URL}${originalUrl.startsWith('/') ? '' : '/'}${originalUrl}`;
  } catch (error) {
    console.error('Error processing thumbnail URL:', error);
    return originalUrl; // Return original URL as fallback
  }
};

/**
 * Gets the correct image URL for the current platform
 * Handles URL replacement for image slides
 */
export const getImageUrl = (originalUrl: string): string => {
  if (!originalUrl) return '';

  console.log('Original Image URL:', originalUrl);

  try {
    // If it's already a proper URL, check if it needs host replacement
    if (originalUrl.startsWith('http://') || originalUrl.startsWith('https://')) {
      // Replace old host with configured API host
      const currentHost = API_URL.replace('/api/v1', '').replace('http://', '').replace('https://', '');
      
      if (originalUrl.includes('172.20.82.76:8082') || 
          originalUrl.includes('192.168.239.147:8082') ||
          originalUrl.includes('localhost:8082')) {
        const oldHost = originalUrl.match(/(172\.20\.82\.76:8082|192\.168\.239\.147:8082|localhost:8082)/)?.[0];
        if (oldHost) {
          const newUrl = originalUrl.replace(oldHost, currentHost);
          console.log('Replaced Image URL:', newUrl);
          return newUrl;
        }
      }
      return originalUrl;
    }

    // If it's a relative path, construct full URL using configured API_URL
    return `${API_URL}${originalUrl.startsWith('/') ? '' : '/'}${originalUrl}`;
  } catch (error) {
    console.error('Error processing image URL:', error);
    return originalUrl; // Return original URL as fallback
  }
};

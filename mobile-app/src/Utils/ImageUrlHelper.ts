const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://192.168.1.230:8082/api/v1";

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

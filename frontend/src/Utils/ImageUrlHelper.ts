const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://172.20.41.84:8081/api/v1";

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

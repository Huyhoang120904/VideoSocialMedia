export default interface FileResponse {
  createdAt: string | null;
  createdBy: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
  id: string;
  fileName: string;
  fileType?: string; // Added to match backend FileType enum
  size: number;
  publicId: string | null;
  url: string;
  secureUrl: string | null;
  format: string;
  width?: number; // Added to match backend
  height?: number; // Added to match backend
  etag?: string; // Added to match backend
  resourceType: string;
  title?: string;
  description?: string;
  thumbnailUrl?: string;
}

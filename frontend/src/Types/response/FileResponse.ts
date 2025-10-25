export default interface FileResponse {
  createdAt: string | null;
  createdBy: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
  id: string;
  fileName: string;
  size: number;
  publicId: string | null;
  url: string;
  secureUrl: string | null;
  format: string;
  resourceType: string;
  title?: string;
  description?: string;
  thumbnailUrl?: string;
}

export interface PaginatedResponse<T = any> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface VideoListResponse<T = any> {
  videos: T[];
  totalElements: number;
  totalPages: number;
}

/**
 * Core type definitions for Admin Portal
 * Following TypeScript best practices and atomic design principles
 */

// ============================================================================
// AUTHENTICATION TYPES
// ============================================================================

export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type UserRole = "admin" | "moderator" | "user";

export interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export interface AuthenticateRequest {
  username: string;
  password: string;
}

export interface AuthenticateResponse {
  token: string;
  refreshToken: string;
  authenticated: boolean;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface RefreshResponse {
  token: string;
  refreshToken: string;
  authenticated: boolean;
}

export interface IntrospectRequest {
  token: string;
}

export interface IntrospectResponse {
  valid: boolean;
  userId?: string;
  username?: string;
  roles?: string[];
}

export interface RegisterRequest {
  username: string;
  password: string;
  mail: string;
  phoneNumber: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  timeStamp: string;
  result: T;
}

export interface PagedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

// ============================================================================
// USER MANAGEMENT TYPES
// ============================================================================

export interface UserResponse {
  id: string;
  username: string;
  mail: string;
  phoneNumber: string;
  enable?: boolean;
  roles: RoleResponse[];
  createdAt?: string;
  updatedAt?: string;
}

export interface RoleResponse {
  id: string;
  name: string;
  description: string;
}

export interface CreateUserRequest {
  username: string;
  mail: string;
  phoneNumber: string;
  password: string;
}

export interface UpdateUserRequest {
  username: string;
  password?: string;
  mail: string;
  phoneNumber: string;
  enable?: boolean;
}

// ============================================================================
// VIDEO MANAGEMENT TYPES (Legacy - kept for compatibility)
// ============================================================================

export interface VideoResponse {
  id: string;
  fileName: string;
  fileType: string;
  size: number;
  url: string;
  secureUrl: string;
  format: string;
  width: number;
  height: number;
  etag: string;
  title?: string;
  description?: string;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FileResponse {
  id: string;
  fileName: string;
  fileType: string;
  resourceType: string;
  format: string;
  size: number;
  url: string;
  secureUrl: string;
  width?: number;
  height?: number;
  bytes?: number;
  uploaderId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UploadVideoRequest {
  file: File;
  title?: string;
  description?: string;
}

// ============================================================================
// FEED ITEM MANAGEMENT TYPES
// ============================================================================

export enum FeedItemType {
  VIDEO = "VIDEO",
  IMAGE_SLIDE = "IMAGE_SLIDE",
  USER_DETAIL = "USER_DETAIL",
}

export interface FeedItemUploadResponse {
  feedItemId: string;
  feedItemType: FeedItemType;
  message?: string;

  // Video fields
  video?: FileResponse;

  // ImageSlide fields
  images?: FileResponse[];
  captions?: string;

  // Common fields
  thumbnailUrl?: string;
  title?: string;
  description?: string;
}

export interface FeedItemListResponse {
  feedItems: PagedResponse<FeedItemUploadResponse>;
  message: string;
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface UploadFeedItemRequest {
  feedItemType: FeedItemType;
  title?: string;
  description?: string;
  thumbnail?: File;
  hashTags?: string[];

  // Video-specific
  videoFile?: File;
  duration?: number;

  // ImageSlide-specific
  images?: File[];
  captions?: string;
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface AnalyticsResponse {
  totalUsers: number;
  activeUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  totalVideos: number;
  videosUploadedToday: number;
  videosUploadedThisWeek: number;
  videosUploadedThisMonth: number;
  totalStorageUsed: number;
  storageUsedThisMonth: number;
  formattedStorageUsed: string;
  totalInteractions: number;
  interactionsToday: number;
  totalComments: number;
  totalReports: number;
  pendingReports: number;
  userGrowthRate: number;
  videoGrowthRate: number;
  engagementRate: number;
  usersByRole: Array<{
    role: string;
    count: number;
  }>;
  videosByType: Array<{
    type: string;
    count: number;
    totalSize: number;
  }>;
  interactionsByType: Array<{
    type: string;
    count: number;
  }>;
}

// ============================================================================
// COMPONENT PROPS TYPES
// ============================================================================

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ModalProps extends BaseComponentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface TableColumn<T> {
  key: keyof T | string;
  title: string;
  render?: (value: unknown, record: T) => React.ReactNode;
  sortable?: boolean;
  width?: string | number;
}

export interface TableProps<T> extends BaseComponentProps {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  helpText?: string;
}

export interface FormProps extends BaseComponentProps {
  onSubmit: (data: Record<string, unknown>) => void | Promise<void>;
  loading?: boolean;
  initialValues?: Record<string, unknown>;
}

// ============================================================================
// NAVIGATION TYPES
// ============================================================================

export interface MenuItem {
  title: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  submenu?: MenuItem[];
  badge?: string | number;
}

export interface BreadcrumbItem {
  title: string;
  href?: string;
}

// ============================================================================
// ERROR HANDLING TYPES
// ============================================================================

export interface ErrorInfo {
  code: number;
  message: string;
  category: ErrorCategory;
  userMessage: string;
}

export enum ErrorCategory {
  CLIENT_ERROR = "CLIENT_ERROR",
  SERVER_ERROR = "SERVER_ERROR",
  NETWORK_ERROR = "NETWORK_ERROR",
  AUTHENTICATION = "AUTHENTICATION",
  AUTHORIZATION = "AUTHORIZATION",
}

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  requestId?: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type Status = "idle" | "loading" | "success" | "error";

export interface AsyncState<T> {
  data: T | null;
  status: Status;
  error: string | null;
}

export type SortOrder = "asc" | "desc";

export interface SortConfig {
  field: string;
  order: SortOrder;
}

// ============================================================================
// THEME TYPES
// ============================================================================

export type Theme = "light" | "dark" | "system";

export interface ThemeConfig {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

// ============================================================================
// DOCUMENT INGESTION TYPES
// ============================================================================

export interface DocumentIngestionResponse {
  message: string;
  filename: string;
  chunksCreated: number;
  fileSize: number;
  contentType: string;
}

export interface BatchIngestionResponse {
  message: string;
  totalFiles: number;
  successCount: number;
  failureCount: number;
  totalChunksCreated: number;
  failures?: Record<string, string> | null;
}

export interface DocumentIngestionProgress {
  status: "uploading" | "processing" | "complete" | "error";
  progress: number;
  message: string;
  fileName?: string;
  chunksCreated?: number;
}

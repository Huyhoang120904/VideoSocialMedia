import api from "./HttpClient";
import { ApiResponse } from "../Types/ApiResponse";
import { Video } from "../store/videoSlice";
import FileResponse from "../Types/response/FileResponse";
import { getVideoUrl } from "../Utils/ImageUrlHelper";

// Interface for paginated response from backend
interface PaginatedResponse {
    content: FileResponse[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
}

// Interface for video list with metadata
export interface VideoListResponse {
    videos: Video[];
    totalElements: number;
    totalPages: number;
}

export const fetchVideos = async (retryCount: number = 0): Promise<ApiResponse<Video[]>> => {
    const MAX_RETRIES = 3;
    
    try {
        const { data } = await api.get<ApiResponse<PaginatedResponse>>("/videos");
        
        // Transform FileResponse[] to Video[]
        const videos: Video[] = data.result?.content?.map((file: FileResponse) => {
            // Use helper function to get correct video URL for current platform
            const videoUrl = getVideoUrl(file.url || file.secureUrl || '');
            
            const video = {
                id: file.id,
                uri: videoUrl,
                title: file.title || file.fileName || 'Untitled Video',
                description: file.description || '',
                likes: 0, // Default values since FileResponse doesn't have these
                comments: 0,
                shares: 0,
                outstanding: 0,
                thumbnailUrl: file.thumbnailUrl
            };
            return video;
        }) || [];

        return {
            ...data,
            result: videos
        };
    } catch (error: any) {
        // Log detailed API error information
        console.error(`API Fetch Videos Error (attempt ${retryCount + 1}):`, error);

        // Log request details
        if (error.config) {
            console.log("Request URL:", error.config.url);
            console.log("Request Method:", error.config.method);
            console.log(
                "Request Headers:",
                JSON.stringify(error.config.headers, null, 2)
            );
        }

        // Log response details if available
        if (error.response) {
            console.log("Response Status:", error.response.status);
            console.log("Response Data:", error.response.data);
        }

        // Retry logic for network errors
        if (retryCount < MAX_RETRIES && (
            error.code === 'NETWORK_ERROR' || 
            error.message?.includes('Network Error') ||
            error.message?.includes('timeout') ||
            !error.response
        )) {
            console.log(`Retrying fetchVideos in ${(retryCount + 1) * 1000}ms...`);
            await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 1000));
            return fetchVideos(retryCount + 1);
        }

        throw new Error(
            error.response?.data?.message || "Failed to fetch videos"
        );
    }
};

export const fetchVideosByUserId = async (userId: string, page: number = 0, size: number = 10): Promise<ApiResponse<VideoListResponse>> => {
    try {
        const { data } = await api.get<ApiResponse<PaginatedResponse>>(`/videos/user/${userId}`, {
            params: { page, size }
        });
        
        // Transform FileResponse[] to Video[]
        const videos: Video[] = data.result?.content?.map((file: FileResponse) => {
            // Use helper function to get correct video URL for current platform
            const videoUrl = getVideoUrl(file.url || file.secureUrl || '');
            
            return {
                id: file.id,
                uri: videoUrl,
                title: file.title || file.fileName || 'Untitled Video',
                description: file.description || '',
                likes: 0, // Default values since FileResponse doesn't have these
                comments: 0,
                shares: 0,
                outstanding: 0,
                thumbnailUrl: file.thumbnailUrl
            };
        }) || [];

        const videoListResponse: VideoListResponse = {
            videos,
            totalElements: data.result?.totalElements || 0,
            totalPages: data.result?.totalPages || 0
        };

        return {
            ...data,
            result: videoListResponse
        };
    } catch (error: any) {
        // Log detailed API error information
        console.error("API Fetch User Videos Error:", error);

        // Log request details
        if (error.config) {
            console.log("Request URL:", error.config.url);
            console.log("Request Method:", error.config.method);
            console.log(
                "Request Headers:",
                JSON.stringify(error.config.headers, null, 2)
            );
        }

        // Log response details if available
        if (error.response) {
            console.log("Response Status:", error.response.status);
            console.log("Response Data:", error.response.data);
        }

        throw new Error(
            error.response?.data?.message || "Failed to fetch user videos"
        );
    }
};

export const uploadVideo = async (formData: FormData, onUploadProgress?: (progressEvent: any) => void): Promise<ApiResponse<any>> => {
    try {
        const { data } = await api.post<ApiResponse<any>>('/videos/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress,
        });

        return data;
    } catch (error: any) {
        console.error("API Upload Video Error:", error);

        // Log request details
        if (error.config) {
            console.log("Request URL:", error.config.url);
            console.log("Request Method:", error.config.method);
            console.log(
                "Request Headers:",
                JSON.stringify(error.config.headers, null, 2)
            );
        }

        // Log response details if available
        if (error.response) {
            console.log("Response Status:", error.response.status);
            console.log("Response Data:", error.response.data);
        }

        throw new Error(
            error.response?.data?.message || "Failed to upload video"
        );
    }
};
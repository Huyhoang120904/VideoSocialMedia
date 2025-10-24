import api from "./HttpClient";
import { ApiResponse } from "../Types/ApiResponse";
import { Video } from "../store/videoSlice";

export const fetchVideos = async (): Promise<ApiResponse<Video[]>> => {
    try {
        const { data } = await api.get<ApiResponse<Video[]>>("/videos");
        return data;
    } catch (error: any) {
        // Log detailed API error information
        console.error("API Fetch Videos Error:", error);

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
            error.response?.data?.message || "Failed to fetch videos"
        );
    }
};
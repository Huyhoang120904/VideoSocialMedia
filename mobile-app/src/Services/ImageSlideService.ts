import api from "./HttpClient";
import { ApiResponse } from "../Types/ApiResponse";

export const uploadImageSlide = async (
  formData: FormData,
  onUploadProgress?: (progressEvent: any) => void
): Promise<ApiResponse<any>> => {
  try {
    const { data } = await api.post<ApiResponse<any>>(
      "/image-slides/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress,
      }
    );

    return data;
  } catch (error: any) {
    console.error("API Upload Image Slide Error:", error);

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
      error.response?.data?.message || "Failed to upload image slide"
    );
  }
};

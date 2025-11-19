import axios from "./HttpClient";
import { ApiResponse } from "../Types/ApiResponse";
import {
  ReportTicketRequest,
} from "../Types/request/ReportTicketRequest";
import { ReportTicketResponse } from "../Types/response/ReportTicketResponse";

const ReportTicketService = {
  /**
   * Create a new report ticket
   */
  createReportTicket: async (
    request: ReportTicketRequest
  ): Promise<ApiResponse<ReportTicketResponse>> => {
    try {
      console.log('📤 ReportTicketService: POST /report-tickets');
      console.log('📤 Request data:', JSON.stringify(request, null, 2));
      
      const response = await axios.post<ApiResponse<ReportTicketResponse>>(
        "/report-tickets",
        request
      );
      
      console.log('✅ ReportTicketService: Response:', response.data);
      return response.data;
    } catch (error: any) {
      // Chỉ log error nếu không phải business logic error (code 1116 = REPORT_LIMIT_EXCEEDED)
      const errorCode = error.response?.data?.code;
      if (errorCode !== 1116) {
        console.error("❌ Error creating report ticket:", error);
        console.error("❌ Error response:", error.response?.data);
        console.error("❌ Error status:", error.response?.status);
        console.error("❌ Error URL:", error.config?.url);
      } else {
        // Business logic error - chỉ log info
        console.log("ℹ️ Report limit exceeded for user");
      }
      throw error;
    }
  },

  /**
   * Get report ticket by ID
   */
  getReportTicketById: async (
    id: string
  ): Promise<ApiResponse<ReportTicketResponse>> => {
    try {
      const response = await axios.get<ApiResponse<ReportTicketResponse>>(
        `/report-tickets/${id}`
      );
      return response.data;
    } catch (error: any) {
      console.error("Error fetching report ticket:", error);
      throw error;
    }
  },
};

export default ReportTicketService;


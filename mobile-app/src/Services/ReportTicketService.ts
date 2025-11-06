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
      const response = await axios.post<ApiResponse<ReportTicketResponse>>(
        "/report-tickets",
        request
      );
      return response.data;
    } catch (error: any) {
      console.error("Error creating report ticket:", error);
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


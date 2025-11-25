import apiClient from "@/config/axios";
import { ApiResponse, FeedItemType, PagedResponse } from "@/types";

export interface ReportTicketResponse {
  id: string;
  feedItemId: string;
  feedItemType: string;
  reportCategory: string;
  reason: string;
  status: string;
  reporterId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReportTicketUpdateRequest {
  status: string;
  reason?: string;
}

export interface ReportCategorySummary {
  category: string;
  count: number;
}

export interface FeedItemReportSummaryResponse {
  feedItemId: string;
  feedItemType: FeedItemType;
  totalReports: number;
  topCategories: ReportCategorySummary[];
  reports: ReportTicketResponse[];
}

class ReportTicketService {
  async getReportTickets(
    page: number = 0,
    size: number = 10
  ): Promise<ApiResponse<PagedResponse<ReportTicketResponse>>> {
    const response = await apiClient.get(
      `/report-tickets?page=${page}&size=${size}`
    );
    return response.data;
  }

  async getReportTicketById(
    id: string
  ): Promise<ApiResponse<ReportTicketResponse>> {
    const response = await apiClient.get(`/report-tickets/${id}`);
    return response.data;
  }

  async getReportTicketsByCategory(
    category: string,
    page: number = 0,
    size: number = 10
  ): Promise<ApiResponse<PagedResponse<ReportTicketResponse>>> {
    const response = await apiClient.get(
      `/report-tickets/category/${category}?page=${page}&size=${size}`
    );
    return response.data;
  }

  async updateReportTicket(
    id: string,
    request: ReportTicketUpdateRequest
  ): Promise<ApiResponse<ReportTicketResponse>> {
    const response = await apiClient.put(`/report-tickets/${id}`, request);
    return response.data;
  }

  async deleteReportTicket(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/report-tickets/${id}`);
    return response.data;
  }

  async getReportTicketsByFeedItemId(
    feedItemId: string
  ): Promise<ApiResponse<FeedItemReportSummaryResponse>> {
    const response = await apiClient.get(
      `/feed-items/${feedItemId}/reports`
    );
    return response.data;
  }
}

export const reportTicketService = new ReportTicketService();


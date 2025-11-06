import { FeedItemType, ReportCategory } from "../request/ReportTicketRequest";

export interface ReportTicketResponse {
  id: string;
  feedItemType: FeedItemType;
  reportCategory: ReportCategory;
  violationContent?: string;
  accepted: boolean;
}


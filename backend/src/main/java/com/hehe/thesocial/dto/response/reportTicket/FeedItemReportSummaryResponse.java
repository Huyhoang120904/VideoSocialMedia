package com.hehe.thesocial.dto.response.reportTicket;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.hehe.thesocial.dto.response.reportTicket.ReportCategorySummary;
import com.hehe.thesocial.dto.response.reportTicket.ReportTicketResponse;
import com.hehe.thesocial.entity.enums.FeedItemType;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class FeedItemReportSummaryResponse {

    String feedItemId;

    FeedItemType feedItemType;

    long totalReports;

    List<ReportCategorySummary> topCategories;

    List<ReportTicketResponse> reports;
}


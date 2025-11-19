package com.hehe.thesocial.service.reportTicketService;

import com.hehe.thesocial.dto.request.reportTicket.ReportTicketRequest;
import com.hehe.thesocial.dto.request.reportTicket.ReportTicketUpdateRequest;
import com.hehe.thesocial.dto.response.reportTicket.ReportTicketResponse;
import com.hehe.thesocial.entity.enums.ReportCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReportTicketService {

    ReportTicketResponse createReportTicket(ReportTicketRequest request);

    ReportTicketResponse getReportTicketById(String id);

    Page<ReportTicketResponse> getAllReportTickets(Pageable pageable);

    Page<ReportTicketResponse> getReportTicketsByCategory(ReportCategory category, Pageable pageable);

    ReportTicketResponse updateReportTicket(String id, ReportTicketUpdateRequest request);

    void deleteReportTicket(String id);
}


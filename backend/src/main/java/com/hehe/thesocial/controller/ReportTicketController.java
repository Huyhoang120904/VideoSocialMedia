package com.hehe.thesocial.controller;

import com.hehe.thesocial.dto.ApiResponse;
import com.hehe.thesocial.dto.request.reportTicket.ReportTicketRequest;
import com.hehe.thesocial.dto.request.reportTicket.ReportTicketUpdateRequest;
import com.hehe.thesocial.dto.response.reportTicket.ReportTicketResponse;
import com.hehe.thesocial.entity.enums.ReportCategory;
import com.hehe.thesocial.service.reportTicketService.ReportTicketService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/report-tickets")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ReportTicketController {

    ReportTicketService reportTicketService;

    @PostMapping
    public ResponseEntity<ApiResponse<ReportTicketResponse>> createReportTicket(
            @Valid @RequestBody ReportTicketRequest request) {
        log.info("Creating report ticket for {} with category: {}",
                request.getFeedItemType(), request.getReportCategory());

        ReportTicketResponse response = reportTicketService.createReportTicket(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<ReportTicketResponse>builder()
                        .result(response)
                        .message("Report ticket created successfully")
                        .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ReportTicketResponse>> getReportTicketById(
            @PathVariable String id) {
        log.info("Fetching report ticket with ID: {}", id);

        ReportTicketResponse response = reportTicketService.getReportTicketById(id);

        return ResponseEntity.ok(ApiResponse.<ReportTicketResponse>builder()
                .result(response)
                .build());
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ReportTicketResponse>>> getAllReportTickets(
            @PageableDefault(size = 10, page = 0) Pageable pageable) {
        log.info("Fetching all report tickets with page: {}, size: {}",
                pageable.getPageNumber(), pageable.getPageSize());

        Page<ReportTicketResponse> response = reportTicketService.getAllReportTickets(pageable);

        return ResponseEntity.ok(ApiResponse.<Page<ReportTicketResponse>>builder()
                .result(response)
                .message(response.getTotalElements() == 0 ?
                        "No report tickets found" : "Report tickets retrieved successfully")
                .build());
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<Page<ReportTicketResponse>>> getReportTicketsByCategory(
            @PathVariable ReportCategory category,
            @PageableDefault(size = 10, page = 0) Pageable pageable) {
        log.info("Fetching report tickets by category: {} with page: {}, size: {}",
                category, pageable.getPageNumber(), pageable.getPageSize());

        Page<ReportTicketResponse> response = reportTicketService.getReportTicketsByCategory(category, pageable);

        return ResponseEntity.ok(ApiResponse.<Page<ReportTicketResponse>>builder()
                .result(response)
                .message(response.getTotalElements() == 0 ?
                        "No report tickets found for this category" :
                        "Report tickets retrieved successfully")
                .build());
    }

    @GetMapping("/status/{accepted}")
    public ResponseEntity<ApiResponse<Page<ReportTicketResponse>>> getReportTicketsByAccepted(
            @PathVariable boolean accepted,
            @PageableDefault(size = 10, page = 0) Pageable pageable) {
        log.info("Fetching report tickets by accepted status: {} with page: {}, size: {}",
                accepted, pageable.getPageNumber(), pageable.getPageSize());

        Page<ReportTicketResponse> response = reportTicketService.getReportTicketsByAccepted(accepted, pageable);

        return ResponseEntity.ok(ApiResponse.<Page<ReportTicketResponse>>builder()
                .result(response)
                .message(response.getTotalElements() == 0 ?
                        "No report tickets found with this status" :
                        "Report tickets retrieved successfully")
                .build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ReportTicketResponse>> updateReportTicket(
            @PathVariable String id,
            @Valid @RequestBody ReportTicketUpdateRequest request) {
        log.info("Updating report ticket with ID: {}", id);

        ReportTicketResponse response = reportTicketService.updateReportTicket(id, request);

        return ResponseEntity.ok(ApiResponse.<ReportTicketResponse>builder()
                .result(response)
                .message("Report ticket updated successfully")
                .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteReportTicket(@PathVariable String id) {
        log.info("Deleting report ticket with ID: {}", id);

        reportTicketService.deleteReportTicket(id);

        return ResponseEntity.status(HttpStatus.NO_CONTENT)
                .body(ApiResponse.<Void>builder()
                        .message("Report ticket deleted successfully")
                        .build());
    }
}


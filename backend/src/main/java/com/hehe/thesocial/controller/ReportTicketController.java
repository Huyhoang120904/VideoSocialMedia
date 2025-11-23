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
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/report-tickets")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
@Tag(name = "Report Tickets", description = "Content reporting and moderation endpoints")
public class ReportTicketController {

    ReportTicketService reportTicketService;

    @Operation(
            summary = "Create report ticket",
            description = "Submit a report for a feed item (video or image slide). Requires authentication."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Report ticket created successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request or report limit exceeded"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @SecurityRequirement(name = "bearerAuth")
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

    @Operation(
            summary = "Get report ticket by ID",
            description = "Retrieve a specific report ticket by its ID. Requires ADMIN or MODERATOR role."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Report ticket retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Report ticket not found")
    })
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    public ResponseEntity<ApiResponse<ReportTicketResponse>> getReportTicketById(
            @Parameter(description = "Report ticket ID", required = true) @PathVariable String id) {
        log.info("Fetching report ticket with ID: {}", id);

        ReportTicketResponse response = reportTicketService.getReportTicketById(id);

        return ResponseEntity.ok(ApiResponse.<ReportTicketResponse>builder()
                .result(response)
                .build());
    }

    @Operation(
            summary = "Get all report tickets",
            description = "Retrieve paginated list of all report tickets. Requires ADMIN or MODERATOR role."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Report tickets retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied")
    })
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    public ResponseEntity<ApiResponse<Page<ReportTicketResponse>>> getAllReportTickets(
            @Parameter(description = "Pagination parameters") @PageableDefault(size = 10, page = 0) Pageable pageable) {
        log.info("Fetching all report tickets with page: {}, size: {}",
                pageable.getPageNumber(), pageable.getPageSize());

        Page<ReportTicketResponse> response = reportTicketService.getAllReportTickets(pageable);

        return ResponseEntity.ok(ApiResponse.<Page<ReportTicketResponse>>builder()
                .result(response)
                .message(response.getTotalElements() == 0 ?
                        "No report tickets found" : "Report tickets retrieved successfully")
                .build());
    }

    @Operation(
            summary = "Get report tickets by category",
            description = "Retrieve paginated report tickets filtered by category. Requires ADMIN or MODERATOR role."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Report tickets retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied")
    })
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/category/{category}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    public ResponseEntity<ApiResponse<Page<ReportTicketResponse>>> getReportTicketsByCategory(
            @Parameter(description = "Report category", required = true) @PathVariable ReportCategory category,
            @Parameter(description = "Pagination parameters") @PageableDefault(size = 10, page = 0) Pageable pageable) {
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

    @Operation(
            summary = "Update report ticket",
            description = "Update a report ticket. Requires ADMIN or MODERATOR role."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Report ticket updated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Report ticket not found")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    public ResponseEntity<ApiResponse<ReportTicketResponse>> updateReportTicket(
            @Parameter(description = "Report ticket ID", required = true) @PathVariable String id,
            @Valid @RequestBody ReportTicketUpdateRequest request) {
        log.info("Updating report ticket with ID: {}", id);

        ReportTicketResponse response = reportTicketService.updateReportTicket(id, request);

        return ResponseEntity.ok(ApiResponse.<ReportTicketResponse>builder()
                .result(response)
                .message("Report ticket updated successfully")
                .build());
    }

    @Operation(
            summary = "Delete report ticket",
            description = "Delete a report ticket. Requires ADMIN or MODERATOR role."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "204", description = "Report ticket deleted successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Report ticket not found")
    })
    @SecurityRequirement(name = "bearerAuth")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    public ResponseEntity<ApiResponse<Void>> deleteReportTicket(
            @Parameter(description = "Report ticket ID", required = true) @PathVariable String id) {
        log.info("Deleting report ticket with ID: {}", id);

        reportTicketService.deleteReportTicket(id);

        return ResponseEntity.status(HttpStatus.NO_CONTENT)
                .body(ApiResponse.<Void>builder()
                        .message("Report ticket deleted successfully")
                        .build());
    }
}


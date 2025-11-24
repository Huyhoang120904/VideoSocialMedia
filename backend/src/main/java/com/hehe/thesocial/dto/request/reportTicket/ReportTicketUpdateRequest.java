package com.hehe.thesocial.dto.request.reportTicket;

import com.hehe.thesocial.entity.enums.ReportStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReportTicketUpdateRequest {
    
    @NotNull(message = "Status is required")
    ReportStatus status;

    String reason; // Optional reason for status update
}


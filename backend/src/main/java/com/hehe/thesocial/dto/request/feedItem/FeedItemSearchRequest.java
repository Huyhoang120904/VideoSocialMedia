package com.hehe.thesocial.dto.request.feedItem;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.hehe.thesocial.entity.enums.FeedItemType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.AccessLevel;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class FeedItemSearchRequest {

    @Schema(description = "Keyword to search across title and description", example = "challenge")
    String keyword;

    @Schema(description = "Filter by feed item type")
    FeedItemType feedItemType;

    @Schema(description = "Filter by active status")
    Boolean active;

    @Schema(description = "Filter by violated flag")
    Boolean violated;

    @Schema(description = "Filter by uploader user detail ID")
    String uploaderId;

    @Schema(description = "Restrict search to specific feed item ids")
    List<String> feedItemIds;

    @Schema(description = "Minimum report count (inclusive)")
    Integer minReportCount;

    @Schema(description = "Maximum report count (inclusive)")
    Integer maxReportCount;

    @Schema(description = "Start of createdAt range (inclusive). ISO-8601 format", example = "2025-01-01T00:00:00")
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    LocalDateTime createdFrom;

    @Schema(description = "End of createdAt range (inclusive). ISO-8601 format", example = "2025-01-31T23:59:59")
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    LocalDateTime createdTo;
}


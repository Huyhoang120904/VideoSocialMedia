package com.hehe.thesocial.dto.response.reportTicket;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.hehe.thesocial.entity.enums.FeedItemType;
import com.hehe.thesocial.entity.enums.ReportCategory;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ReportTicketResponse {

    String id;

    FeedItemType feedItemType;

    String videoId;

    String imageSlideId;

    ReportCategory reportCategory;

    String violationContent;
}


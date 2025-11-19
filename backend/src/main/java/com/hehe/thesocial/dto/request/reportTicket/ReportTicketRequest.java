package com.hehe.thesocial.dto.request.reportTicket;

import com.hehe.thesocial.entity.enums.FeedItemType;
import com.hehe.thesocial.entity.enums.ReportCategory;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReportTicketRequest {
    FeedItemType feedItemType;
    String targetId;
    ReportCategory reportCategory;
    String violationContent;
}

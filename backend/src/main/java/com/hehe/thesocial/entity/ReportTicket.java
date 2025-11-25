package com.hehe.thesocial.entity;

import com.hehe.thesocial.entity.enums.ReportCategory;
import com.hehe.thesocial.entity.enums.ReportStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.time.LocalDateTime;

@Document("report_ticket")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class ReportTicket extends BaseDocument {
    @EqualsAndHashCode.Include
    @MongoId
    @Field("_id")
    String id;

    @DBRef
    @Field("user_detail_ref")
    UserDetail userDetail;

    @Field("report_category")
    ReportCategory reportCategory;

    @Field("violation_content")
    String violationContent;

    @Field("feed_item_id")
    String feedItemId;
}

package com.hehe.thesocial.entity;

import com.hehe.thesocial.entity.enums.FeedItemType;
import com.hehe.thesocial.entity.enums.ReportCategory;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.MongoId;

@Document("report_ticket")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class ReportTicket {
    @EqualsAndHashCode.Include
    @MongoId
    @Field("_id")
    String id;

    @Field("feed_item_type")
    FeedItemType feedItemType;

    @DBRef
    @Field("video_ref")
    Video video;

    @DBRef
    @Field("image_slide_ref")
    ImageSlide imageSlide;

    @DBRef
    @Field("user_detail_ref")
    UserDetail userDetail;

    @Field("report_category")
    ReportCategory reportCategory;

    @Field("violation_content")
    String violationContent;

    @Field("accepted")
    boolean accepted;
}

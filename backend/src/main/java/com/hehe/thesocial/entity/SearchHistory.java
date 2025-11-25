package com.hehe.thesocial.entity;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.time.LocalDateTime;

@Document(collection = "search_history")
@CompoundIndex(name = "user_search_idx", def = "{'user_detail_id': 1, 'created_at': -1}")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SearchHistory {
    @MongoId
    @Field("_id")
    String id;

    @Field("user_detail_id")
    String userDetailId;

    @Field("query")
    String query;

    @Field("created_at")
    LocalDateTime createdAt;
}

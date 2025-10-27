package com.hehe.thesocial.entity;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.MongoId;

@Document(collection = "metadata")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class MetaData {
    @EqualsAndHashCode.Include
    @MongoId
    @Field("_id")
    String id;

    @Field("loves_count")
    Long lovesCount = 0L;
    
    @Field("comments_count")
    Long commentsCount = 0L;
    
    @Field("favourites_count")
    Long favouritesCount = 0L;
    
    @Field("views_count")
    Long viewsCount = 0L;
    
    @Field("shares_count")
    Long sharesCount = 0L;
}

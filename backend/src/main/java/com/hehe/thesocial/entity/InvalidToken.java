package com.hehe.thesocial.entity;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.util.Date;

@Document(collection = "invalid_tokens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class InvalidToken extends BaseDocument {
    @MongoId
    @Field("_id")
    String id;

    @Field("user_id")
    String userId;

    @Field("token_id")
    String tokenId;

    @Field("expire_at")
    Date expireAt;
}

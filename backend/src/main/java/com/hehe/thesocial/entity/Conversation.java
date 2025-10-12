package com.hehe.thesocial.entity;

import com.hehe.thesocial.entity.enums.ConversationType;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.util.Set;

@Document(collection = "conversations")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
public class Conversation extends BaseDocument {
    @EqualsAndHashCode.Include
    @MongoId
    @Field("_id")
    String conversationId;

    @Field("participant_hash")
    String participantHash;

    @DBRef
    @Field("user_details_ref")
    Set<UserDetail> userDetails;

    @DBRef
    @Field("avatar_ref")
    FileDocument avatar;

    @Field("creator_id")
    String creatorId;

    @Field("conversation_name")
    String conversationName;

    @Field("conversation_type")
    ConversationType conversationType;
}

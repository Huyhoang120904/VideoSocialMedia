package com.hehe.thesocial.entity;

import com.hehe.thesocial.entity.enums.ConversationType;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.util.Set;
import java.util.stream.Collectors;

@Document("conversations")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Conversation {
    @MongoId
    String conversationId;

    String participantHash;

    @DBRef
    Set<UserDetail> userDetails;

    FileDocument avatar;

    String creatorId;

    String conversationName;

    ConversationType conversationType;

}

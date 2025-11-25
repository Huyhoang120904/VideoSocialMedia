package com.hehe.thesocial.entity;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.hehe.thesocial.entity.enums.ChatMessageType;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.List;

@Document(value = "chat_message")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
public class ChatMessage extends BaseDocument {
    @EqualsAndHashCode.Include
    @Id
    String id;

    String conversationId;

    String senderId;

    String message;

    Boolean edited;

    @DBRef
    FileDocument fileDocument;

    @DBRef
    FileDocument avatar;

    @Field("read_participants_id")
    List<String> readParticipantsId;

    ChatMessageType messageType;

    //Share type-specific field
    @Field("feedItem")
    String feedItemId;

    //AI chat fields
    String role;
    String content;
}

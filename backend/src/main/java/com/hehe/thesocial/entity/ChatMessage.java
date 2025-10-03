package com.hehe.thesocial.entity;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DocumentReference;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.MongoId;


import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "chat_messages")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ChatMessage extends BaseDocument {
    @MongoId
    @Field("_id")
    String id;

    @Field("message")
    String message;

    @Field("sender")
    String sender;

    @DocumentReference(lazy = true)
    @Field("file_document_ref")
    FileDocument fileDocument;

    @Field("conversation_id")
    String conversationId;

    @Field("time")
    LocalDateTime time;

    @Field("edited")
    boolean edited;

    @Field("read_participants_id")
    List<String> readParticipantsId;
}

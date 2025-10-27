package com.hehe.thesocial.dto.event;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReadStatusEventDTO {
    String messageId;
    String conversationId;
    List<String> readParticipantsId;
    Integer readCount;
    String readerId;
}

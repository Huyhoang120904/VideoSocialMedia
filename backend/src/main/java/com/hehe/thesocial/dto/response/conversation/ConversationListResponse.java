package com.hehe.thesocial.dto.response.conversation;


import com.fasterxml.jackson.annotation.JsonInclude;
import com.hehe.thesocial.entity.FileDocument;
import com.hehe.thesocial.entity.UserDetail;
import com.hehe.thesocial.entity.enums.ConversationType;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ConversationListResponse {
    String conversationId;

    FileDocument avatar;

    String conversationName;
    ConversationType conversationType;
}

package com.hehe.thesocial.dto.response.conversation;


import com.hehe.thesocial.dto.response.chat.ChatMessageResponse;
import com.hehe.thesocial.dto.response.userDetail.UserDetailResponse;
import com.hehe.thesocial.entity.FileDocument;
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
public class ConversationResponse {
    String conversationId;
    Set<UserDetailResponse> userDetails;
    List<String> participantIds;  // Added this field

    FileDocument avatar;

    String creatorId;

    String conversationName;
    ConversationType conversationType;

    ChatMessageResponse newestChatMessage;
    
    Integer unreadCount;
    Boolean hasUnreadMessages;
}

package com.hehe.thesocial.dto.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReadStatusEventDTO {
    private String messageId;
    private String conversationId;
    private String readerId;
}

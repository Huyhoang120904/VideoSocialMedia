package com.hehe.thesocial.entity.enums;

import lombok.Getter;

@Getter
public enum ChatMessageStatus {
    READ("Read"),
    SENT("Sent"),
    DELIVERED("Delivered")
    ;

    private final String des;

    ChatMessageStatus(String des) {
        this.des = des;
    }


}

package com.hehe.thesocial.entity.enums;

import lombok.Getter;

@Getter
public enum InteractionType {
    VIEW(1f),
    LIKE(3f),
    COMMENT(4f),
    SHARE(5f),
    SKIP(-2f),
    WATCH_COMPLETE(2f),
    FOLLOW_CREATOR(6f)

    ;
    private final float weight;

    InteractionType(float weight) {
        this.weight = weight;
    }


}

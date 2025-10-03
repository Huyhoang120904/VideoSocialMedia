package com.hehe.thesocial.entity.enums;

import lombok.Getter;

@Getter
public enum FileType {
    VIDEO("/upload/videos"),
    IMAGE("/upload/images"),
    THUMBNAIL("/upload/thumbnails"),
    PROFILE_IMAGE("/upload/pfp")

    ;

    private String location;

    FileType(String location) {

        this.location = location;
    }


}

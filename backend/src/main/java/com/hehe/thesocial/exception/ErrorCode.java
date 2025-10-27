package com.hehe.thesocial.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    UNCATEGORIZED(HttpStatus.INTERNAL_SERVER_ERROR, 9999, "Unknown Error"),



    UNAUTHENTICATED(HttpStatus.BAD_REQUEST, 1001, "Invalid authentication info"),
    USER_ACCOUNT_DISABLED(HttpStatus.FORBIDDEN, 1002, "User account is disabled"),

    INVALID_FILE(HttpStatus.BAD_REQUEST, 1051, "File uploaded not valid!"),
    ERROR_UPLOADING_FILE(HttpStatus.INTERNAL_SERVER_ERROR, 1052, "File uploaded having trouble"),
    FILE_NOT_FOUND(HttpStatus.NOT_FOUND, 1053, "File not found!"),

    USER_NOT_FOUND(HttpStatus.NOT_FOUND, 1101, "User not found!"),
    VIDEO_NOT_FOUND(HttpStatus.NOT_FOUND, 1102, "Video not found!"),
    IMAGE_SLIDE_NOT_FOUND(HttpStatus.NOT_FOUND, 1103, "Image slide not found!"),
    ROLE_NOT_FOUND(HttpStatus.NOT_FOUND, 1104, "Role not found!"),
    CONVERSATION_NOT_FOUND(HttpStatus.NOT_FOUND, 1105, "Conversation not found!"),
    MESSAGE_NOT_FOUND(HttpStatus.NOT_FOUND, 1106, "Message not found!"),

    INVALID_KEY(HttpStatus.UNAUTHORIZED, 1107, "Invalid key"),
    USER_EXISTED(HttpStatus.BAD_REQUEST, 1108, "Already following user!"),
    INVALID_CONVERSATION_PARTICIPANTS(HttpStatus.BAD_REQUEST, 1109, "Conversation info not valid"),
    CONVERSATION_ALREADY_EXISTS(HttpStatus.BAD_REQUEST, 1110, "Conversation between these participants already exists!"),
    INVALID_CONVERSATION_TYPE(HttpStatus.BAD_REQUEST, 1111, "Invalid conversation type for this operation"),
    CONVERSATION_ACCESS_DENIED(HttpStatus.FORBIDDEN, 1112, "Access denied to this conversation");


    private final HttpStatus httpStatus;
    private final int code;
    private final String message;

    ErrorCode(HttpStatus httpStatus, int code, String message) {
        this.message = message;
        this.httpStatus = httpStatus;
        this.code = code;
    }

    @Override
    public String toString() {
        return super.toString();
    }
}

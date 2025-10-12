package com.hehe.thesocial.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    UNCATEGORIZED(HttpStatus.INTERNAL_SERVER_ERROR, 9999, "Unknown Error"),



    UNAUTHENTICATED(HttpStatus.BAD_REQUEST, 1001, "Invalid authentication info"),

    INVALID_FILE(HttpStatus.BAD_REQUEST, 1051, "File uploaded not valid!"),
    ERROR_UPLOADING_FILE(HttpStatus.INTERNAL_SERVER_ERROR, 1052, "File uploaded having trouble"),
    FILE_NOT_FOUND(HttpStatus.NOT_FOUND, 1053, "File not found!"),

    USER_NOT_FOUND(HttpStatus.NOT_FOUND, 1101, "User not found!"),
    ROLE_NOT_FOUND(HttpStatus.NOT_FOUND, 1102, "Role not found!"),
    CONVERSATION_NOT_FOUND(HttpStatus.NOT_FOUND, 1103, "Conversation not found!"),
    MESSAGE_NOT_FOUND(HttpStatus.NOT_FOUND, 1104, "Message not found!"),

    INVALID_KEY(HttpStatus.UNAUTHORIZED,1105, "Invalid key" ),
    USER_EXISTED(HttpStatus.BAD_REQUEST, 1106, "Already following user!"),
    INVALID_CONVERSATION_PARTICIPANTS(HttpStatus.BAD_REQUEST, 1107, "Conversation info not valid"),
    CONVERSATION_ALREADY_EXISTS(HttpStatus.BAD_REQUEST, 1108, "Conversation between these participants already exists!"),
    INVALID_CONVERSATION_TYPE(HttpStatus.BAD_REQUEST, 1109, "Invalid conversation type for this operation"),
    CONVERSATION_ACCESS_DENIED(HttpStatus.FORBIDDEN, 1110, "Access denied to this conversation")

    ;


    private HttpStatus httpStatus;
    private int code;
    private String message;

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

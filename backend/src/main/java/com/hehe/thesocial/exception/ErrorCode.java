package com.hehe.thesocial.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    UNCATERGORIZED(HttpStatus.INTERNAL_SERVER_ERROR, 9999, "Unknown Error"),

    UNAUTHENTICATED(HttpStatus.BAD_REQUEST, 1001, "Invalid authentication info"),


    USER_NOT_FOUND(HttpStatus.NOT_FOUND, 1101, "User not found!"),
    ROLE_NOT_FOUND(HttpStatus.NOT_FOUND, 1102, "Role not found!"),


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

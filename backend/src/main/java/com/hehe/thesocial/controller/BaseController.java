package com.hehe.thesocial.controller;

import com.hehe.thesocial.dto.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

/**
 * Provides shared helpers for building ApiResponse-wrapped ResponseEntity objects,
 * ensuring a consistent contract across controllers while keeping endpoint logic concise.
 */
public abstract class BaseController {

    protected <T> ResponseEntity<ApiResponse<T>> ok(T result) {
        return ResponseEntity.ok(buildResponse(result, null));
    }

    protected <T> ResponseEntity<ApiResponse<T>> ok(T result, String message) {
        return ResponseEntity.ok(buildResponse(result, message));
    }

    protected ResponseEntity<ApiResponse<Void>> okMessage(String message) {
        return ResponseEntity.ok(buildResponse(null, message));
    }

    protected <T> ResponseEntity<ApiResponse<T>> created(T result) {
        return respond(HttpStatus.CREATED, result, null);
    }

    protected <T> ResponseEntity<ApiResponse<T>> created(T result, String message) {
        return respond(HttpStatus.CREATED, result, message);
    }

    protected ResponseEntity<ApiResponse<Void>> respond(HttpStatus status, String message) {
        return respond(status, null, message);
    }

    protected <T> ResponseEntity<ApiResponse<T>> respond(HttpStatus status, T result, String message) {
        return ResponseEntity.status(status).body(buildResponse(result, message));
    }

    private <T> ApiResponse<T> buildResponse(T result, String message) {
        ApiResponse.ApiResponseBuilder<T> builder = ApiResponse.<T>builder().result(result);
        if (message != null && !message.isBlank()) {
            builder.message(message);
        }
        return builder.build();
    }
}


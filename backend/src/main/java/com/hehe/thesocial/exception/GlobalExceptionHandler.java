package com.hehe.thesocial.exception;

import com.hehe.thesocial.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(value = AppException.class)
    ResponseEntity<ApiResponse<?>> appExceptionHandler(AppException ex) {
        log.error("App Error: {}", ex.getMessage());
        ApiResponse<Void> apiResponse = ApiResponse.<Void>builder()
                .code(ex.getErrorCode().getCode())
                .message(ex.getErrorCode().getMessage())
                .build();
        return ResponseEntity.status(ex.getErrorCode().getHttpStatus()).body(apiResponse);
    }

    @ExceptionHandler(value = RuntimeException.class)
    ResponseEntity<ApiResponse<?>> runtimeExceptionHandler(RuntimeException ex) {
        ex.printStackTrace();
        log.error("Runtime Error: ", ex);
        ApiResponse<Void> apiResponse = ApiResponse.<Void>builder()
                .code(ErrorCode.UNCATEGORIZED.getCode())
                .message(ErrorCode.UNCATEGORIZED.getMessage())
                .build();
        return ResponseEntity.internalServerError().body(apiResponse);
    }

    @ExceptionHandler(value = JwtException.class)
    ResponseEntity<ApiResponse> jwtExceptionHandler(JwtException ex) {
        ex.printStackTrace();
        log.error("Runtime Error: ", ex);
        ApiResponse<Void> apiResponse = ApiResponse.<Void>builder().build();
        apiResponse.setCode(ErrorCode.UNCATEGORIZED.getCode());
        apiResponse.setMessage(ErrorCode.UNCATEGORIZED.getMessage());
        return ResponseEntity.internalServerError().body(apiResponse);
    }


}

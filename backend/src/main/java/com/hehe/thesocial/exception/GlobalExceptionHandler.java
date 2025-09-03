package com.hehe.thesocial.exception;

import com.hehe.thesocial.dto.ApiResponse;
import com.mongodb.MongoWriteException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {


    @ExceptionHandler(value = RuntimeException.class)
    ResponseEntity<ApiResponse> runtimeExceptionHandler(RuntimeException ex) {
        log.error("Runtime Error: ", ex);
        ApiResponse<Void> apiResponse = ApiResponse.<Void>builder().build();
        apiResponse.setCode(ErrorCode.UNCATERGORIZED.getCode());
        apiResponse.setMessage(ErrorCode.UNCATERGORIZED.getMessage());
        return ResponseEntity.internalServerError().body(apiResponse);
    }

    @ExceptionHandler(value = AppException.class)
    ResponseEntity<ApiResponse> runtimeExceptionHandler(AppException ex) {
        log.error("App Error: ", ex);
        ApiResponse<Void> apiResponse = ApiResponse.<Void>builder().build();
        apiResponse.setCode(ex.getErrorCode().getCode());
        apiResponse.setMessage(ex.getErrorCode().getMessage());
        return ResponseEntity.status(ex.getErrorCode().getHttpStatus()).body(apiResponse);
    }



}

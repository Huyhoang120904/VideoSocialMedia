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
    REPORT_TICKET_NOT_FOUND(HttpStatus.NOT_FOUND, 1107, "Report ticket not found!"),
    USER_INTERACTION_NOT_FOUND(HttpStatus.NOT_FOUND, 1108, "User interaction not found!"),
    COMMENT_NOT_FOUND(HttpStatus.NOT_FOUND, 1108, "Comment not found!"),
    COMMENT_ACCESS_DENIED(HttpStatus.FORBIDDEN, 1117, "You are not allowed to modify this comment"),
    FEED_ITEM_NOT_FOUND(HttpStatus.NOT_FOUND, 1115, "Feed item not found!"),
    NOTIFICATION_NOT_FOUND(HttpStatus.NOT_FOUND, 1118, "Notification not found!"),

    INVALID_KEY(HttpStatus.UNAUTHORIZED, 1109, "Invalid key"),
    USER_EXISTED(HttpStatus.BAD_REQUEST, 1110, "Already following user!"),
    INVALID_CONVERSATION_PARTICIPANTS(HttpStatus.BAD_REQUEST, 1111, "Conversation info not valid"),
    CONVERSATION_ALREADY_EXISTS(HttpStatus.BAD_REQUEST, 1112, "Conversation between these participants already exists!"),
    INVALID_CONVERSATION_TYPE(HttpStatus.BAD_REQUEST, 1113, "Invalid conversation type for this operation"),
    CONVERSATION_ACCESS_DENIED(HttpStatus.FORBIDDEN, 1114, "Access denied to this conversation"),
    INVALID_REQUEST(HttpStatus.BAD_REQUEST, 1115, "Invalid request parameters"),
    REPORT_LIMIT_EXCEEDED(HttpStatus.BAD_REQUEST, 1116, "Bạn đã báo cáo tối đa! Admin sẽ xử lý sau."),
    
    // RAG-related errors
    RAG_DOCUMENT_NOT_FOUND(HttpStatus.NOT_FOUND, 1201, "RAG document not found!"),
    RAG_ADD_DOCUMENT_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, 1202, "Failed to add document to vector store"),
    RAG_SEARCH_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, 1203, "Failed to search vector store"),
    RAG_DELETE_DOCUMENT_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, 1204, "Failed to delete document from vector store"),
    RAG_INVALID_DOCUMENT(HttpStatus.BAD_REQUEST, 1205, "Invalid document content"),
    RAG_QUERY_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, 1206, "Failed to process RAG query with AI model"),
    
    // Document ingestion errors
    DOCUMENT_EMPTY_FILE(HttpStatus.BAD_REQUEST, 1301, "Document file is empty"),
    DOCUMENT_UNSUPPORTED_FORMAT(HttpStatus.BAD_REQUEST, 1302, "Unsupported document format"),
    DOCUMENT_NO_CONTENT_EXTRACTED(HttpStatus.BAD_REQUEST, 1303, "No content could be extracted from document"),
    DOCUMENT_NO_FILES_PROVIDED(HttpStatus.BAD_REQUEST, 1304, "No files provided for ingestion"),
    DOCUMENT_ALREADY_EXIST(HttpStatus.BAD_REQUEST, 1305, "Document already exists"),
    DOCUMENT_INGESTION_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, 1306, "Failed to ingest document"),
    
    // AI Chat errors
    AI_CHAT_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, 1401, "Failed to get response from AI service. Please try again later."),
    AI_CHAT_INVALID_RESPONSE(HttpStatus.INTERNAL_SERVER_ERROR, 1402, "AI service returned an invalid response. Please try again.");


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

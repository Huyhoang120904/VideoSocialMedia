package com.hehe.thesocial.repository;

import com.hehe.thesocial.entity.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {
    Page<ChatMessage> findAllByConversationId(String conversationId, Pageable pageable);

    void deleteByConversationId(String conversationId);

    List<ChatMessage> findByConversationIdOrderByCreatedAtDesc(String conversationId);
}

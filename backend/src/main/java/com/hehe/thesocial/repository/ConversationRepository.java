package com.hehe.thesocial.repository;

import com.hehe.thesocial.entity.Conversation;
import com.hehe.thesocial.entity.UserDetail;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Set;

@Repository
public interface ConversationRepository extends MongoRepository<Conversation, String> {

    Page<Conversation> findByUserDetailsContaining(Set<UserDetail> userDetails, Pageable pageable);
}

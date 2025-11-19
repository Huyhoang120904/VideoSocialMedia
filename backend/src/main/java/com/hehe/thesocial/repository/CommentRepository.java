package com.hehe.thesocial.repository;

import com.hehe.thesocial.entity.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommentRepository extends MongoRepository<Comment, String> {
    Page<Comment> findByFeedItemIdOrderByCreatedAtDesc(String feedItemId, Pageable
            pageable);
}

package com.hehe.thesocial.repository;

import com.hehe.thesocial.entity.FeedItem;
import com.hehe.thesocial.entity.enums.FeedItemType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FeedItemRepository extends MongoRepository<FeedItem, String> {
    
    Page<FeedItem> findByFeedItemType(FeedItemType feedItemType, Pageable pageable);
}


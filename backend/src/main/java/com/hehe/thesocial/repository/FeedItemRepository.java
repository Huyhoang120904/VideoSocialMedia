package com.hehe.thesocial.repository;

import com.hehe.thesocial.entity.FeedItem;
import com.hehe.thesocial.entity.HashTag;
import com.hehe.thesocial.entity.UserDetail;
import com.hehe.thesocial.entity.enums.FeedItemType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Set;

@Repository
public interface FeedItemRepository extends MongoRepository<FeedItem, String> {
    Page<FeedItem> findByFeedItemType(FeedItemType feedItemType, Pageable pageable);
    Page<FeedItem> findByUploader(UserDetail uploader, Pageable pageable);
    List<FeedItem> findAllByHashTags_NameInAndIdNotIn(Set<String> hashTags, Set<String> id);
    List<FeedItem> findByIdNotIn(Collection<String> ids, Pageable pageable);
}


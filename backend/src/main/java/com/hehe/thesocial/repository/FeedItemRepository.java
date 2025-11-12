package com.hehe.thesocial.repository;

import com.hehe.thesocial.entity.FeedItem;
import com.hehe.thesocial.entity.UserDetail;
import com.hehe.thesocial.entity.enums.FeedItemType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FeedItemRepository extends MongoRepository<FeedItem, String> {
    Page<FeedItem> findByFeedItemType(FeedItemType feedItemType, Pageable pageable);
    Page<FeedItem> findByUploader(UserDetail uploader, Pageable pageable);


    @Aggregation(pipeline = {
        "{ $lookup: { from: 'metadata', localField: 'metadata_ref.$id', foreignField: '_id', as: 'metaData' } }",
        "{ $unwind: { path: '$metaData', preserveNullAndEmptyArrays: true } }",
        "{ $skip: ?#{#pageable.offset} }",
        "{ $limit: ?#{#pageable.pageSize} }"
    })
    Slice<FeedItem> findAllWithMetadata(Pageable pageable);
}


package com.hehe.thesocial.repository;

import com.hehe.thesocial.entity.SearchHistory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SearchHistoryRepository extends MongoRepository<SearchHistory, String> {
    List<SearchHistory> findByUserDetailIdOrderByCreatedAtDesc(String userDetailId);

    void deleteByUserDetailId(String userDetailId);

    void deleteByUserDetailIdAndQuery(String userDetailId, String query);
}

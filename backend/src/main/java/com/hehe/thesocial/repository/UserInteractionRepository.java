package com.hehe.thesocial.repository;

import com.hehe.thesocial.entity.UserInteraction;
import com.hehe.thesocial.entity.enums.InteractionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Repository
public interface UserInteractionRepository extends MongoRepository<UserInteraction, String> {
    List<UserInteraction> findByFeedItemIdAndInteractionTypeIn(String feedItemId, List<InteractionType> interactionTypes);

    Set<UserInteraction> findByUserDetailIdAndCreatedAtAfter(String userDetailId, LocalDateTime createdAt);

    List<UserInteraction> findByUserDetailIdAndInteractionTypeIn(String userDetailId, List<InteractionType> interactionTypes, PageRequest pageable);

    Page<UserInteraction> findByUserDetailId(String userDetailId, Pageable pageable);
}

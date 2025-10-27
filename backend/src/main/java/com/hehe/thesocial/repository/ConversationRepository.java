package com.hehe.thesocial.repository;

import com.hehe.thesocial.dto.response.conversation.ConversationResponse;
import com.hehe.thesocial.entity.Conversation;
import com.hehe.thesocial.entity.UserDetail;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.Set;

@Repository
public interface ConversationRepository extends MongoRepository<Conversation, String> {

    Page<Conversation> findByUserDetailsContaining(Set<UserDetail> userDetails, Pageable pageable);

    Optional<Conversation> findByParticipantHash(String participantHash);

    @Query(value = "{ '_id' : ?0 }")
    @Aggregation(pipeline = {
            "{ '$match': { '_id': ?0 } }",
            "{ '$lookup': { 'from': 'user_details', 'localField': 'user_details_ref', 'foreignField': '_id', 'as': 'userDetails' } }"
    })
    Optional<Conversation> findByIdWithUserDetails(String conversationId);

}

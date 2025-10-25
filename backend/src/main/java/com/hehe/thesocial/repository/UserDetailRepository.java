package com.hehe.thesocial.repository;

import com.hehe.thesocial.entity.User;
import com.hehe.thesocial.entity.UserDetail;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserDetailRepository extends MongoRepository<UserDetail, String> {
    Optional<UserDetail> findByUser(User user);

    @Query("{'user_ref.$id': ?0}")
    Optional<UserDetail> findByUserId(String userId);

    @Query("{'display_name': {$regex: ?0, $options: 'i'}}")
    List<UserDetail> findByDisplayNameContainingIgnoreCase(String displayName);

    @Query("{'user_ref.username': {$regex: ?0, $options: 'i'}}")
    List<UserDetail> findByUserUsernameContainingIgnoreCase(String username);

    @Query(value = "{ '_id' : ?0 }")
    @Aggregation(pipeline = {
            "{ '$match': { '_id': ?0 } }",
            "{ '$lookup': { 'from': 'users', 'localField': 'user_ref', 'foreignField': '_id', 'as': 'user' } }",
            "{ '$unwind': { 'path': '$user', 'preserveNullAndEmptyArrays': true } }"
    })
    Optional<UserDetail> findByIdWithUser(String userDetailId);

    User User(User user);
}

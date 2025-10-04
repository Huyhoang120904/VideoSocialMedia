package com.hehe.thesocial.repository;

import com.hehe.thesocial.entity.User;
import com.hehe.thesocial.entity.UserDetail;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserDetailRepository extends MongoRepository<UserDetail, String> {
    Optional<UserDetail> findByUser(User user);

    @Query("{'user.id': ?0}")
    Optional<UserDetail> findByUserId(String userId);

    @Query("{'displayName': {$regex: ?0, $options: 'i'}}")
    List<UserDetail> findByDisplayNameContainingIgnoreCase(String displayName);

    @Query("{'user.username': {$regex: ?0, $options: 'i'}}")
    List<UserDetail> findByUserUsernameContainingIgnoreCase(String username);
}

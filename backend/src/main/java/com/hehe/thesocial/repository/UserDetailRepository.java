package com.hehe.thesocial.repository;

import com.hehe.thesocial.entity.User;
import com.hehe.thesocial.entity.UserDetail;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserDetailRepository extends MongoRepository<UserDetail, String> {

    Optional<UserDetail> findByUser_Id(String userId);

    String user(User user);
}

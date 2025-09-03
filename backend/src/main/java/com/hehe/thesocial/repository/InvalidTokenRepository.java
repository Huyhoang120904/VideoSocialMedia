package com.hehe.thesocial.repository;

import com.hehe.thesocial.entity.InvalidToken;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InvalidTokenRepository extends MongoRepository<InvalidToken, String> {
}

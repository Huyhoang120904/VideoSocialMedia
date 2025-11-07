package com.hehe.thesocial.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserInteractionRepository extends MongoRepository<UserInteractionRepository, String> {
}

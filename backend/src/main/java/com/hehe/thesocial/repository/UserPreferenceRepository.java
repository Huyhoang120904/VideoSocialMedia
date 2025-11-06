package com.hehe.thesocial.repository;

import com.hehe.thesocial.entity.UserPreference;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserPreferenceRepository extends MongoRepository<UserPreference, String> {
}

package com.hehe.thesocial.repository;

import com.hehe.thesocial.entity.HashTag;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HashTagRepository extends MongoRepository<HashTag, String> {
    
    HashTag findByName(String name);
    
    List<HashTag> findByNameIn(List<String> names);
}


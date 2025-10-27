package com.hehe.thesocial.repository;

import com.hehe.thesocial.entity.MetaData;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MetaDataRepository extends MongoRepository<MetaData, String> {
}


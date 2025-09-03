package com.hehe.thesocial.repository;

import com.hehe.thesocial.entity.FileDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FileRepository extends MongoRepository<FileDocument, String> {
}

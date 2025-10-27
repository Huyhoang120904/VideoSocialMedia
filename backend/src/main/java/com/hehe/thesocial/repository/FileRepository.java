package com.hehe.thesocial.repository;

import com.hehe.thesocial.entity.FileDocument;
import org.springframework.data.domain.Page;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Pageable;
import java.util.Optional;

@Repository
public interface FileRepository extends MongoRepository<FileDocument, String> {
    @Query("{'resource_type': ?0}")
    Page<FileDocument> findByResourceType(String resourceType, Pageable pageable);
    
    Optional<FileDocument> findByUrl(String url);
}

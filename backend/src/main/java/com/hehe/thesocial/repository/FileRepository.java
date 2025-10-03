package com.hehe.thesocial.repository;

import com.hehe.thesocial.entity.FileDocument;
import org.springframework.data.domain.Page;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Pageable;

@Repository
public interface FileRepository extends MongoRepository<FileDocument, String> {
    Page<FileDocument> findByResourceType(String video, Pageable pageable);
}

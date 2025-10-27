package com.hehe.thesocial.repository;

import com.hehe.thesocial.entity.UserDetail;
import com.hehe.thesocial.entity.Video;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface VideoRepository extends MongoRepository<Video, String> {
    
    @Query("{'uploader_ref.$id': ?0}")
    Page<Video> findByUploaderId(String uploaderId, Pageable pageable);
    
    Page<Video> findByUploader(UserDetail uploader, Pageable pageable);
}

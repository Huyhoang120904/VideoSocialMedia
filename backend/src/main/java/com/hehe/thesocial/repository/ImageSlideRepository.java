package com.hehe.thesocial.repository;

import com.hehe.thesocial.entity.ImageSlide;
import com.hehe.thesocial.entity.UserDetail;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ImageSlideRepository extends MongoRepository<ImageSlide, String> {
    
    @Query("{'uploader_ref.$id': ?0}")
    Page<ImageSlide> findByUploaderId(String uploaderId, Pageable pageable);
    
    Page<ImageSlide> findByUploader(UserDetail uploader, Pageable pageable);
}


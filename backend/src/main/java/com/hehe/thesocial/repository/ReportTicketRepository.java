package com.hehe.thesocial.repository;

import com.hehe.thesocial.entity.ReportTicket;
import com.hehe.thesocial.entity.enums.ReportCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportTicketRepository extends MongoRepository<ReportTicket, String> {
    Page<ReportTicket> findByReportCategory(ReportCategory reportCategory, Pageable pageable);
    
    // Tìm reports theo feedItemId
    List<ReportTicket> findByFeedItemId(String feedItemId);
    
    // Đếm số lần user đã báo cáo feedItem này
    long countByUserDetail_IdAndFeedItemId(String userDetailId, String feedItemId);
}


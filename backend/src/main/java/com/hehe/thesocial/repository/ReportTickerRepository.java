package com.hehe.thesocial.repository;

import com.hehe.thesocial.entity.ReportTicket;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReportTickerRepository extends MongoRepository<ReportTicket , String> {
}

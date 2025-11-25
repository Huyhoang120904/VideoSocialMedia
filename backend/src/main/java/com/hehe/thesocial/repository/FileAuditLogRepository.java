package com.hehe.thesocial.repository;

import com.hehe.thesocial.entity.FileAuditLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FileAuditLogRepository extends MongoRepository<FileAuditLog, String> {
}


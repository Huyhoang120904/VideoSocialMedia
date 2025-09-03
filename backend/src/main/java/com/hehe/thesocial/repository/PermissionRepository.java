package com.hehe.thesocial.repository;

import com.hehe.thesocial.entity.Permission;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PermissionRepository extends MongoRepository<Permission, String> {
}

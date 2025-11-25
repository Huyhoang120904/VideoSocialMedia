package com.hehe.thesocial.repository;

import com.hehe.thesocial.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {
    Page<Notification> findByRecipientIdOrderByCreatedAtDesc(String recipientId, Pageable pageable);

    Page<Notification> findByRecipientIdAndReadFalseOrderByCreatedAtDesc(String recipientId, Pageable pageable);

    Optional<Notification> findByIdAndRecipientId(String notificationId, String recipientId);

    List<Notification> findByRecipientIdAndReadFalse(String recipientId);
}










package com.hehe.thesocial.mapper.notification;

import com.hehe.thesocial.dto.response.notification.NotificationResponse;
import com.hehe.thesocial.entity.Notification;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.time.Instant;
import java.time.ZoneOffset;

@Mapper(componentModel = "spring")
public interface NotificationMapper {

    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "readAt", ignore = true)
    @Mapping(target = "actor", ignore = true)
    NotificationResponse toResponse(Notification notification);

    @AfterMapping
    default void mapTimestamps(@MappingTarget NotificationResponse response, Notification notification) {
        if (notification.getCreatedAt() != null) {
            response.setCreatedAt(notification.getCreatedAt().toInstant(ZoneOffset.UTC));
        }
        if (notification.getReadAt() != null) {
            response.setReadAt(notification.getReadAt().toInstant(ZoneOffset.UTC));
        }
    }
}










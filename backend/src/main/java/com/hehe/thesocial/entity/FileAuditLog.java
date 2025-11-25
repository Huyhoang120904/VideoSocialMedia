package com.hehe.thesocial.entity;

import com.hehe.thesocial.entity.enums.FileActionType;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.MongoId;

@Document(collection = "file_audit_logs")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
public class FileAuditLog extends BaseDocument {

    @EqualsAndHashCode.Include
    @MongoId
    @Field("_id")
    String id;

    @Field("file_id")
    String fileId;

    @Field("action")
    FileActionType action;

    @Field("action_reason")
    String actionReason;

    @DBRef
    @Field("actor_ref")
    UserDetail actor;
}


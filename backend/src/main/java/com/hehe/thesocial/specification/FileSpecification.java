package com.hehe.thesocial.specification;

import com.hehe.thesocial.dto.request.file.FileSearchRequest;
import com.hehe.thesocial.entity.enums.FileStatus;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.List;

public final class FileSpecification {

    private FileSpecification() {
    }

    public static Query buildQuery(FileSearchRequest request, String uploaderId) {
        Query query = new Query();

        if (request == null) {
            return query;
        }

        List<Criteria> criteriaList = new ArrayList<>();

        if (StringUtils.hasText(request.getKeyword())) {
            String keyword = escapeRegex(request.getKeyword().trim());
            criteriaList.add(new Criteria().orOperator(
                    Criteria.where("file_name").regex(keyword, "i"),
                    Criteria.where("original_file_name").regex(keyword, "i"),
                    Criteria.where("description").regex(keyword, "i")
            ));
        }

        if (StringUtils.hasText(request.getFileType())) {
            switch (request.getFileType().toLowerCase()) {
                case "video" -> criteriaList.add(Criteria.where("resource_type").is("video"));
                case "image" -> criteriaList.add(Criteria.where("resource_type").is("image"));
                case "other" -> criteriaList.add(new Criteria().orOperator(
                        Criteria.where("resource_type").nin(List.of("video", "image")),
                        Criteria.where("resource_type").exists(false)
                ));
                default -> {
                }
            }
        }

        FileStatus status = request.getStatus();
        if (status != null) {
            criteriaList.add(Criteria.where("status").is(status));
        }

        if (StringUtils.hasText(uploaderId)) {
            criteriaList.add(Criteria.where("uploader_ref.$id").is(uploaderId));
        }

        if (request.getMinSize() != null || request.getMaxSize() != null) {
            Criteria sizeCriteria = Criteria.where("size");
            if (request.getMinSize() != null) {
                sizeCriteria = sizeCriteria.gte(request.getMinSize());
            }
            if (request.getMaxSize() != null) {
                sizeCriteria = sizeCriteria.lte(request.getMaxSize());
            }
            criteriaList.add(sizeCriteria);
        }

        LocalDateTime createdFrom = request.getCreatedFrom();
        LocalDateTime createdTo = request.getCreatedTo();
        if (createdFrom != null || createdTo != null) {
            Criteria dateCriteria = Criteria.where("created_at");
            if (createdFrom != null) {
                dateCriteria = dateCriteria.gte(createdFrom);
            }
            if (createdTo != null) {
                dateCriteria = dateCriteria.lte(createdTo);
            }
            criteriaList.add(dateCriteria);
        }

        criteriaList.forEach(query::addCriteria);
        return query;
    }

    private static String escapeRegex(String input) {
        String escaped = input.replaceAll("([\\\\.*+?\\[^\\]$(){}=!<>|:-])", "\\\\$1");
        return ".*" + escaped + ".*";
    }
}


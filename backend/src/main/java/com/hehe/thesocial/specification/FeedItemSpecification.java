package com.hehe.thesocial.specification;

import com.hehe.thesocial.dto.request.feedItem.FeedItemSearchRequest;
import com.hehe.thesocial.entity.enums.FeedItemType;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public final class FeedItemSpecification {

    private FeedItemSpecification() {
    }

    public static Query buildQuery(FeedItemSearchRequest request) {
        Query query = new Query();
        if (request == null) {
            return query;
        }

        List<Criteria> criteriaList = new ArrayList<>();

        if (StringUtils.hasText(request.getKeyword())) {
            String keyword = request.getKeyword().trim();
            String regex = String.format(".*%s.*", keyword.replaceAll("([\\\\.*+?\\[^\\]$(){}=!<>|:-])", "\\\\$1"));
            criteriaList.add(new Criteria().orOperator(
                    Criteria.where("title").regex(regex, "i"),
                    Criteria.where("description").regex(regex, "i")
            ));
        }

        FeedItemType type = request.getFeedItemType();
        if (type != null) {
            criteriaList.add(Criteria.where("feed_item_type").is(type));
        }

        if (request.getActive() != null) {
            criteriaList.add(Criteria.where("active").is(request.getActive()));
        }

        if (request.getViolated() != null) {
            criteriaList.add(Criteria.where("status").is(request.getViolated()));
        }

        if (request.getMinReportCount() != null || request.getMaxReportCount() != null) {
            Criteria reportCriteria = Criteria.where("report_count");
            if (request.getMinReportCount() != null) {
                reportCriteria = reportCriteria.gte(request.getMinReportCount());
            }
            if (request.getMaxReportCount() != null) {
                reportCriteria = reportCriteria.lte(request.getMaxReportCount());
            }
            criteriaList.add(reportCriteria);
        }

        LocalDateTime createdFrom = request.getCreatedFrom();
        LocalDateTime createdTo = request.getCreatedTo();
        if (createdFrom != null || createdTo != null) {
            Criteria createdCriteria = Criteria.where("created_at");
            if (createdFrom != null) {
                createdCriteria = createdCriteria.gte(createdFrom);
            }
            if (createdTo != null) {
                createdCriteria = createdCriteria.lte(createdTo);
            }
            criteriaList.add(createdCriteria);
        }

        if (StringUtils.hasText(request.getUploaderId())) {
            criteriaList.add(buildUploaderCriteria(request.getUploaderId().trim()));
        }

        if (!CollectionUtils.isEmpty(request.getFeedItemIds())) {
            criteriaList.add(Criteria.where("_id").in(request.getFeedItemIds()));
        }

        criteriaList.forEach(query::addCriteria);
        return query;
    }

    private static Criteria buildUploaderCriteria(String uploaderId) {
        if (ObjectId.isValid(uploaderId)) {
            return Criteria.where("uploader_ref.$id").is(new ObjectId(uploaderId));
        }
        return Criteria.where("uploader_ref.$id").is(uploaderId);
    }
}


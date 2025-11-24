package com.hehe.thesocial.mapper.reportTicket;

import com.hehe.thesocial.dto.request.reportTicket.ReportTicketRequest;
import com.hehe.thesocial.dto.request.reportTicket.ReportTicketUpdateRequest;
import com.hehe.thesocial.dto.response.reportTicket.ReportTicketResponse;
import com.hehe.thesocial.entity.ReportTicket;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ReportTicketMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "userDetail", ignore = true) // Set manually in service
    @Mapping(target = "status", ignore = true) // Default to PENDING
    ReportTicket toReportTicket(ReportTicketRequest request);

    @Mapping(target = "videoId", ignore = true) // ReportTicket không có video nữa
    @Mapping(target = "imageSlideId", ignore = true) // ReportTicket không có imageSlide nữa
    @Mapping(target = "feedItemType", ignore = true) // Set manually in service
    @Mapping(target = "reason", source = "violationContent")
    @Mapping(target = "reporterId", source = "userDetail.id")
    @Mapping(target = "feedItemId", source = "feedItemId")
    ReportTicketResponse toReportTicketResponse(ReportTicket reportTicket);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "userDetail", ignore = true)
    @Mapping(target = "feedItemId", ignore = true)
    @Mapping(target = "reportCategory", ignore = true)
    @Mapping(target = "violationContent", ignore = true)
    void updateReportTicket(@MappingTarget ReportTicket reportTicket, ReportTicketUpdateRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "userDetail", ignore = true)
    @Mapping(target = "feedItemId", ignore = true)
    void updateReportTicket(@MappingTarget ReportTicket reportTicket, ReportTicketRequest request);
}


package com.hehe.thesocial.mapper.reportTicket;

import com.hehe.thesocial.dto.request.reportTicket.ReportTicketRequest;
import com.hehe.thesocial.dto.response.reportTicket.ReportTicketResponse;
import com.hehe.thesocial.entity.ReportTicket;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ReportTicketMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "video", ignore = true)
    @Mapping(target = "imageSlide", ignore = true)
    @Mapping(target = "accepted", ignore = true)
    ReportTicket toReportTicket(ReportTicketRequest request);

    @Mapping(target = "videoId", source = "video.id")
    @Mapping(target = "imageSlideId", source = "imageSlide.id")
    ReportTicketResponse toReportTicketResponse(ReportTicket reportTicket);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "video", ignore = true)
    @Mapping(target = "imageSlide", ignore = true)
    @Mapping(target = "feedItemType", ignore = true)
    @Mapping(target = "reportCategory", ignore = true)
    @Mapping(target = "violationContent", ignore = true)
    void updateReportTicket(@MappingTarget ReportTicket reportTicket, ReportTicketRequest request);
}


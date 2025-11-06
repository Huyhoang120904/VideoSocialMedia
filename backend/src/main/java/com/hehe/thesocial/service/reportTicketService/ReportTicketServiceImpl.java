package com.hehe.thesocial.service.reportTicketService;

import com.hehe.thesocial.dto.request.reportTicket.ReportTicketRequest;
import com.hehe.thesocial.dto.request.reportTicket.ReportTicketUpdateRequest;
import com.hehe.thesocial.dto.response.reportTicket.ReportTicketResponse;
import com.hehe.thesocial.entity.ImageSlide;
import com.hehe.thesocial.entity.ReportTicket;
import com.hehe.thesocial.entity.UserDetail;
import com.hehe.thesocial.entity.Video;
import com.hehe.thesocial.entity.enums.FeedItemType;
import com.hehe.thesocial.entity.enums.ReportCategory;
import com.hehe.thesocial.exception.AppException;
import com.hehe.thesocial.exception.ErrorCode;
import com.hehe.thesocial.mapper.reportTicket.ReportTicketMapper;
import com.hehe.thesocial.repository.ImageSlideRepository;
import com.hehe.thesocial.repository.ReportTicketRepository;
import com.hehe.thesocial.repository.UserDetailRepository;
import com.hehe.thesocial.repository.VideoRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Slf4j
public class ReportTicketServiceImpl implements ReportTicketService {

    ReportTicketRepository reportTicketRepository;
    ReportTicketMapper reportTicketMapper;
    VideoRepository videoRepository;
    ImageSlideRepository imageSlideRepository;
    UserDetailRepository userDetailRepository;

    @Override
    @Transactional
    public ReportTicketResponse createReportTicket(ReportTicketRequest request) {
        log.info("Creating report ticket for {} with category: {}",
                request.getFeedItemType(), request.getReportCategory());

        validateFeedItemReference(request);

        ReportTicket reportTicket = reportTicketMapper.toReportTicket(request);
        reportTicket.setAccepted(false);

        // Set the appropriate reference based on feed item type
        if (request.getFeedItemType() == FeedItemType.VIDEO ) {
            Video video = videoRepository.findById(request.getTargetId())
                    .orElseThrow(() -> new AppException(ErrorCode.VIDEO_NOT_FOUND));
            reportTicket.setVideo(video);
        } else if (request.getFeedItemType() == FeedItemType.IMAGE_SLIDE) {
            ImageSlide imageSlide = imageSlideRepository.findById(request.getTargetId())
                    .orElseThrow(() -> new AppException(ErrorCode.IMAGE_SLIDE_NOT_FOUND));
            reportTicket.setImageSlide(imageSlide);
        } else if (request.getFeedItemType() == FeedItemType.USER_DETAIL) {
            UserDetail userDetail = userDetailRepository.findById(request.getTargetId())
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
            reportTicket.setUserDetail(userDetail);
        }

        reportTicket = reportTicketRepository.save(reportTicket);
        log.info("Report ticket created with ID: {}", reportTicket.getId());

        return reportTicketMapper.toReportTicketResponse(reportTicket);
    }

    @Override
    public ReportTicketResponse getReportTicketById(String id) {
        log.info("Fetching report ticket with ID: {}", id);

        ReportTicket reportTicket = reportTicketRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.REPORT_TICKET_NOT_FOUND));

        return reportTicketMapper.toReportTicketResponse(reportTicket);
    }

    @Override
    public Page<ReportTicketResponse> getAllReportTickets(Pageable pageable) {
        log.info("Fetching all report tickets with page: {}, size: {}",
                pageable.getPageNumber(), pageable.getPageSize());

        Page<ReportTicket> reportTickets = reportTicketRepository.findAll(pageable);
        log.info("Found {} report tickets", reportTickets.getTotalElements());

        return reportTickets.map(reportTicketMapper::toReportTicketResponse);
    }

    @Override
    public Page<ReportTicketResponse> getReportTicketsByCategory(ReportCategory category, Pageable pageable) {
        log.info("Fetching report tickets by category: {} with page: {}, size: {}",
                category, pageable.getPageNumber(), pageable.getPageSize());

        Page<ReportTicket> reportTickets = reportTicketRepository.findByReportCategory(category, pageable);
        log.info("Found {} report tickets for category: {}", reportTickets.getTotalElements(), category);

        return reportTickets.map(reportTicketMapper::toReportTicketResponse);
    }

    @Override
    public Page<ReportTicketResponse> getReportTicketsByAccepted(boolean accepted, Pageable pageable) {
        log.info("Fetching report tickets by accepted status: {} with page: {}, size: {}",
                accepted, pageable.getPageNumber(), pageable.getPageSize());

        Page<ReportTicket> reportTickets = reportTicketRepository.findByAccepted(accepted, pageable);
        log.info("Found {} report tickets with accepted status: {}", reportTickets.getTotalElements(), accepted);

        return reportTickets.map(reportTicketMapper::toReportTicketResponse);
    }

    @Override
    @Transactional
    public ReportTicketResponse updateReportTicket(String id, ReportTicketUpdateRequest request) {
        log.info("Updating report ticket with ID: {}", id);

        ReportTicket reportTicket = reportTicketRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.REPORT_TICKET_NOT_FOUND));

        if (request.getAccepted() != null) {
            reportTicket.setAccepted(request.getAccepted());
        }

        reportTicket = reportTicketRepository.save(reportTicket);
        log.info("Report ticket updated with ID: {}", id);

        return reportTicketMapper.toReportTicketResponse(reportTicket);
    }

    @Override
    @Transactional
    public void deleteReportTicket(String id) {
        log.info("Deleting report ticket with ID: {}", id);

        ReportTicket reportTicket = reportTicketRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.REPORT_TICKET_NOT_FOUND));

        reportTicketRepository.delete(reportTicket);
        log.info("Report ticket deleted with ID: {}", id);
    }

    private void validateFeedItemReference(ReportTicketRequest request) {
        if (request.getFeedItemType() == FeedItemType.VIDEO && request.getTargetId() == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
        if (request.getFeedItemType() == FeedItemType.IMAGE_SLIDE && request.getTargetId() == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
        if (request.getFeedItemType() == FeedItemType.USER_DETAIL && request.getTargetId() == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
    }
}

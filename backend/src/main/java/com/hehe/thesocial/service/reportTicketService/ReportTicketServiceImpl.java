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
import com.hehe.thesocial.entity.FeedItem;
import com.hehe.thesocial.repository.FeedItemRepository;
import com.hehe.thesocial.repository.ImageSlideRepository;
import com.hehe.thesocial.repository.ReportTicketRepository;
import com.hehe.thesocial.repository.UserDetailRepository;
import com.hehe.thesocial.repository.VideoRepository;
import com.hehe.thesocial.util.AuthenticationHelper;
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
    FeedItemRepository feedItemRepository;
    AuthenticationHelper authenticationHelper;

    @Override
    @Transactional
    public ReportTicketResponse createReportTicket(ReportTicketRequest request) {
        log.info("Creating report ticket for {} with category: {}",
                request.getFeedItemType(), request.getReportCategory());

        validateFeedItemReference(request);

        // Lấy người gửi báo cáo từ JWT token
        UserDetail reporter = authenticationHelper.getCurrentUserDetail();
        
        // Validate: Kiểm tra số lần đã báo cáo (giới hạn 5 lần)
        if (request.getFeedItemId() != null && !request.getFeedItemId().isEmpty()) {
            long existingReportCount = reportTicketRepository.countByUserDetail_IdAndFeedItemId(
                    reporter.getId(),
                    request.getFeedItemId()
            );
            
            if (existingReportCount >= 5) {
                log.warn("User {} đã báo cáo feedItem {} {} lần, vượt quá giới hạn 5 lần",
                        reporter.getId(), request.getFeedItemId(), existingReportCount);
                throw new AppException(ErrorCode.REPORT_LIMIT_EXCEEDED);
            }
            
            log.info("User {} đã báo cáo feedItem {} {} lần (giới hạn: 5)",
                    reporter.getId(), request.getFeedItemId(), existingReportCount);
        }
        
        ReportTicket reportTicket = reportTicketMapper.toReportTicket(request);
        reportTicket.setUserDetail(reporter); // Set người gửi báo cáo

        if (request.getFeedItemId() == null || request.getFeedItemId().isEmpty()) {
            if (request.getFeedItemType() != FeedItemType.USER_DETAIL) {
                throw new AppException(ErrorCode.INVALID_REQUEST);
            }
        } else {
            // Tìm FeedItem và tăng reportCount
            FeedItem feedItem = feedItemRepository.findById(request.getFeedItemId())
                    .orElseThrow(() -> new AppException(ErrorCode.FEED_ITEM_NOT_FOUND));
            
            reportTicket.setFeedItemId(feedItem.getId());
            
            // Increment reportCount in FeedItem
            feedItem.setReportCount(feedItem.getReportCount() + 1);
            feedItemRepository.save(feedItem);
            
            log.info("FeedItem {} reportCount incremented to {}", feedItem.getId(), feedItem.getReportCount());
        }

        reportTicket = reportTicketRepository.save(reportTicket);
        log.info("Report ticket created with ID: {} for feedItem: {}", reportTicket.getId(), reportTicket.getFeedItemId());

        ReportTicketResponse response = reportTicketMapper.toReportTicketResponse(reportTicket);
        // Set feedItemType từ request vì ReportTicket entity không có field này
        response.setFeedItemType(request.getFeedItemType());
        return response;
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
    @Transactional
    public ReportTicketResponse updateReportTicket(String id, ReportTicketUpdateRequest request) {
        log.info("Updating report ticket with ID: {}", id);

        ReportTicket reportTicket = reportTicketRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.REPORT_TICKET_NOT_FOUND));

        // ReportTicketUpdateRequest hiện tại không có field nào để update
        // Có thể thêm các field khác nếu cần trong tương lai

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
        // Validate feedItemType + targetId (chỉ để validate, không dùng để tìm FeedItem)
        if (request.getFeedItemType() == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
        
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

package com.hehe.thesocial.service.userInteractions;

import com.hehe.thesocial.dto.request.userInteraction.UserInteractionRequest;
import com.hehe.thesocial.entity.UserInteraction;
import com.hehe.thesocial.entity.enums.InteractionType;
import com.hehe.thesocial.mapper.userInteraction.UserInteractionMapper;
import com.hehe.thesocial.repository.UserInteractionRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Slf4j
public class UserInteractionServiceImpl implements UserInteractionService {
    UserInteractionRepository userInteractionRepository;
    UserInteractionMapper userInteractionMapper;

    @Transactional
    @Override
    public String batchSaveUserInteraction(List<UserInteractionRequest> userInteractions) {
        // Validate input
        if (userInteractions == null || userInteractions.isEmpty()) {
            log.warn("Empty user interactions list provided");
            return "Success";
        }

        try {
            List<UserInteraction> interactions = userInteractions.stream()
                .filter(request -> request != null 
                    && request.getFeedItemId() != null 
                    && request.getUserDetailId() != null
                    && request.getWatchDuration() != null
                    && request.getWatchDuration() > 0)
                .map(request -> {
                    UserInteraction interaction = userInteractionMapper.toUserInteraction(request);
                    
                    // Tự động set interactionType = VIEW khi có watchDuration
                    if (interaction.getWatchDuration() != null && interaction.getWatchDuration() > 0) {
                        interaction.setInteractionType(InteractionType.VIEW);
                    }
                    
                    // Set createdAt nếu chưa có
                    if (interaction.getCreatedAt() == null) {
                        interaction.setCreatedAt(LocalDateTime.now());
                    }
                    
                    return interaction;
                })
                .toList();
            
            if (interactions.isEmpty()) {
                log.warn("No valid interactions to save after filtering");
                return "Success";
            }
            
            userInteractionRepository.saveAll(interactions);
            
            String userDetailId = userInteractions.get(0).getUserDetailId();
            log.info("Successfully saved {} interaction(s) from user detail: {}", 
                interactions.size(), userDetailId);
            
            return "Success";
        } catch (Exception e) {
            log.error("Error saving user interactions: ", e);
            throw new RuntimeException("Failed to save user interactions: " + e.getMessage(), e);
        }
    }

}

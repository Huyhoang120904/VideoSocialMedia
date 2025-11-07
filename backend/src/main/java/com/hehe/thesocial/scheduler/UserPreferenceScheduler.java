package com.hehe.thesocial.scheduler;

import com.hehe.thesocial.repository.UserPreferenceRepository;
import com.hehe.thesocial.service.userPreference.UserPreferenceService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserPreferenceScheduler {
    UserPreferenceService userPreferenceService;
    UserPreferenceRepository userPreferenceRepository;

    @Scheduled(cron = "0 0 2 * * *")
    public void updateUserPreference() {
        log.info("Starting scheduled preference update for active users");

        try {
            // Find users whose preferences haven't been updated in the last 24 hours
            LocalDateTime yesterday = LocalDateTime.now().minusDays(1);

            List<String> userDetailIds = userPreferenceRepository.findAll().stream()
                    .filter(pref -> pref.getUpdatedAt() == null ||
                            pref.getUpdatedAt().isBefore(yesterday))
                    .map(pref -> pref.getUserDetailId())
                    .toList();

            log.info("Found {} users to update preferences", userDetailIds.size());

            for (String userDetailId : userDetailIds) {
                userPreferenceService.updateUserPreferences(userDetailId);
            }

            log.info("Completed preference update for {} users", userDetailIds.size());
        } catch (Exception e) {
            log.error("Error in scheduled preference update", e);
        }
    }


}

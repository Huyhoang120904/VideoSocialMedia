package com.hehe.thesocial.service.userPreference;

import org.springframework.transaction.annotation.Transactional;

public interface UserPreferenceService {
    @Transactional
    void updateUserPreferences(String userDetailId);
}

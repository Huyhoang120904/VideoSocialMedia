package com.hehe.thesocial.service.userInteractions;

import com.hehe.thesocial.dto.request.userInteraction.UserInteractionRequest;
import com.hehe.thesocial.dto.response.userInteraction.UserInteractionResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface UserInteractionService {
    String batchSaveUserInteraction(List<UserInteractionRequest> userInteractions);

    Page<UserInteractionResponse> getUserInteractions(Pageable pageable);

    Page<UserInteractionResponse> getUserInteractionsByUser(String userDetailId, Pageable pageable);
}


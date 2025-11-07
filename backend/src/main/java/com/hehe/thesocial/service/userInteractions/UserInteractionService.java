package com.hehe.thesocial.service.userInteractions;

import com.hehe.thesocial.dto.request.userInteraction.UserInteractionRequest;
import com.hehe.thesocial.entity.UserInteraction;

import java.util.List;

public interface UserInteractionService {
    String batchSaveUserInteraction(List<UserInteractionRequest> userInteractions);
}


package com.hehe.thesocial.service.userInteractions;

import com.hehe.thesocial.dto.request.userInteraction.UserInteractionRequest;
import com.hehe.thesocial.mapper.userInteraction.UserInteractionMapper;
import com.hehe.thesocial.repository.UserInteractionRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        userInteractionRepository.saveAll(userInteractions.stream().map(userInteractionMapper::toUserInteraction).toList());
        log.info("Save {} interaction from user detail: {} ", userInteractions.size(), userInteractions.get(0).getUserDetailId());
        return "Sucess";
    }

}

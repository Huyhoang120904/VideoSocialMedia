package com.hehe.thesocial.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hehe.thesocial.entity.FileDocument;
import com.hehe.thesocial.entity.User;
import com.hehe.thesocial.entity.UserDetail;
import com.hehe.thesocial.entity.enums.FileStatus;
import com.hehe.thesocial.repository.FileRepository;
import com.hehe.thesocial.repository.UserDetailRepository;
import com.hehe.thesocial.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Set;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
class FileControllerIntegrationTest {

    @Autowired
    MockMvc mockMvc;
    @Autowired
    FileRepository fileRepository;
    @Autowired
    UserRepository userRepository;
    @Autowired
    UserDetailRepository userDetailRepository;
    @Autowired
    ObjectMapper objectMapper;

    @BeforeEach
    void cleanUp() {
        fileRepository.deleteAll();
        userDetailRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void searchFiles_returnsMatchingResults() throws Exception {
        User user = User.builder()
                .id("user-1")
                .username("admin-user")
                .mail("admin@example.com")
                .password("secret")
                .enable(true)
                .roles(Set.of())
                .build();
        userRepository.save(user);

        UserDetail userDetail = UserDetail.builder()
                .id("detail-1")
                .user(user)
                .displayName("Admin")
                .build();
        userDetailRepository.save(userDetail);

        FileDocument document = FileDocument.builder()
                .id("file-1")
                .fileName("video-one.mp4")
                .originalFileName("video-one.mp4")
                .size(1_024L)
                .resourceType("video")
                .uploader(userDetail)
                .status(FileStatus.ACTIVE)
                .build();
        fileRepository.save(document);

        String requestBody = """
                {
                  "keyword": "video",
                  "fileType": "video",
                  "page": 0,
                  "size": 10
                }
                """;

        mockMvc.perform(post("/api/v1/files/search")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.files.content[0].fileName").value("video-one.mp4"));
    }
}


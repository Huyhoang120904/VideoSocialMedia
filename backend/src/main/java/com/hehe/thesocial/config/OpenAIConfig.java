package com.hehe.thesocial.config;

import com.hehe.thesocial.service.aiChat.MongoChatMemory;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.ai.openai.api.OpenAiApi;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class OpenAIConfig {
    @Value("${spring.ai.openai.api-key}")
    private String apiKey;

    @Value("classpath:templates/DefaultSystemPrompt.st")
    private Resource defaultSystemPromptResource;

    private final MongoChatMemory chatMemory;

    @Bean
    public OpenAiApi openAiApi() {
        return OpenAiApi.builder().apiKey(apiKey).build();
    }


    @Bean
    public OpenAiChatModel openAiChatModel(OpenAiApi openAiApi) {
        OpenAiChatOptions options = OpenAiChatOptions.builder()
                .temperature(0.7)
                .maxTokens(150)
                .model("gpt-3.5-turbo")
                .build();

        return OpenAiChatModel.builder().openAiApi(openAiApi).defaultOptions(options).build();
    }

    @Bean
    public ChatClient chatClient(ChatClient.Builder builder) {
        return builder
                .defaultSystem(promptSystemSpec -> promptSystemSpec.text(defaultSystemPromptResource))
                .build();
    }


}

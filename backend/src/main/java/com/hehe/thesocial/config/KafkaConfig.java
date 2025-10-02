package com.hehe.thesocial.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.KafkaAdmin;

@Configuration
public class KafkaConfig {
    @Bean
    public KafkaAdmin.NewTopics newTopics() {
        return new KafkaAdmin.NewTopics(
                new NewTopic("chat_messages", 3, (short) 1),
                new NewTopic("notifications", 1, (short) 1),
                new NewTopic("user_events", 2, (short) 1)
        );
    }
}

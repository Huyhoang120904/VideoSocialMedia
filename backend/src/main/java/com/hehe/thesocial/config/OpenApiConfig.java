package com.hehe.thesocial.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("The Social Api")
                        .version("1.0.0")
                        .description("API documentation for your frontend")
                        .contact(new Contact()
                                .name("Nguyễn Huy Hoàng")
                                .email("hoang.nguyen.12904@gmail.com")
                                .url("https://github.com/Huyhoang120904")
                                )
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")));
    }
}

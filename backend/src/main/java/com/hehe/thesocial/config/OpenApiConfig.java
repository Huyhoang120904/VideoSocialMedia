package com.hehe.thesocial.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {
    
    @Value("${server.host:localhost}")
    private String serverHost;
    
    @Value("${server.port:8082}")
    private String serverPort;
    
    @Value("${server.servlet.context-path:/api/v1}")
    private String contextPath;

    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "bearerAuth";
        return new OpenAPI()
                .info(new Info()
                        .title("The Social API")
                        .version("1.0.0")
                        .description("""
                                RESTful API documentation for The Social platform - A TikTok-like social media application.

                                ## Authentication
                                Most endpoints require JWT authentication. Include the token in the Authorization header:
                                ```
                                Authorization: Bearer <your-jwt-token>
                                ```

                                ## Roles
                                - **ADMIN**: Full system access
                                - **MODERATOR**: Content moderation access
                                - **USER**: Standard user access

                                ## Base URL
                                The API base URL is: `http://%s:%s%s`
                                """.formatted(serverHost, serverPort, contextPath))
                        .contact(new Contact()
                                .name("Nguyễn Huy Hoàng")
                                .email("hoang.nguyen.12904@gmail.com")
                                .url("https://github.com/Huyhoang120904"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .servers(List.of(
                        new Server()
                                .url("http://" + serverHost + ":" + serverPort + contextPath)
                                .description("Development Server"),
                        new Server()
                                .url("https://api.thesocial.com" + contextPath)
                                .description("Production Server")
                ))
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName, new SecurityScheme()
                                .name(securitySchemeName)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("JWT token obtained from /auth/token endpoint")));
    }
}

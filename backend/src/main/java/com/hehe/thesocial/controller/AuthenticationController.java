package com.hehe.thesocial.controller;

import com.hehe.thesocial.dto.ApiResponse;
import com.hehe.thesocial.dto.request.auth.AuthenticateRequest;
import com.hehe.thesocial.dto.request.auth.IntrospectRequest;
import com.hehe.thesocial.dto.request.auth.LogoutRequest;
import com.hehe.thesocial.dto.request.auth.RefreshRequest;
import com.hehe.thesocial.dto.response.auth.AuthenticateResponse;
import com.hehe.thesocial.dto.response.auth.IntrospectResponse;
import com.hehe.thesocial.dto.response.auth.RefreshResponse;
import com.hehe.thesocial.service.authentication.AuthenticationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
@Tag(name = "Authentication", description = "Authentication and authorization endpoints")
public class AuthenticationController extends BaseController {

    AuthenticationService authenticationService;

    @Operation(
            summary = "Authenticate user",
            description = "Authenticate user with username and password. Returns JWT access token and refresh token."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Authentication successful",
                    content = @Content(schema = @Schema(implementation = AuthenticateResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid credentials"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Account is disabled")
    })
    @PostMapping("/token")
    public ResponseEntity<ApiResponse<AuthenticateResponse>> authenticate(@RequestBody AuthenticateRequest request) {
        return ok(authenticationService.authenticate(request));
    }

    @Operation(
            summary = "Refresh access token",
            description = "Refresh the access token using a valid refresh token."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Token refreshed successfully",
                    content = @Content(schema = @Schema(implementation = RefreshResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid refresh token")
    })
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<RefreshResponse>> refresh(@RequestBody RefreshRequest request) {
        return ok(authenticationService.refreshToken(request));
    }

    @Operation(
            summary = "Introspect token",
            description = "Validate and get information about a JWT token."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Token introspection successful",
                    content = @Content(schema = @Schema(implementation = IntrospectResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid token")
    })
    @PostMapping("/introspect")
    public ResponseEntity<ApiResponse<IntrospectResponse>> introspectToken(@RequestBody IntrospectRequest request) {
        return ok(authenticationService.introspectToken(request));
    }

    @Operation(
            summary = "Logout user",
            description = "Logout user and invalidate the JWT token. Requires authentication."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Logout successful"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = "bearerAuth")
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@RequestBody LogoutRequest request) {
        authenticationService.logout(request);
        return okMessage("Logout successful");
    }
}

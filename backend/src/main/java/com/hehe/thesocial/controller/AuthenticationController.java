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
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class AuthenticationController {

    AuthenticationService authenticationService;

    @PostMapping("/token")
    public ApiResponse<AuthenticateResponse> authenticate(@RequestBody AuthenticateRequest request) {
        return ApiResponse.<AuthenticateResponse>builder()
                .result(authenticationService.authenticate(request))
                .build();
    }

    @PostMapping("/refresh")
    public ApiResponse<RefreshResponse> authenticate(@RequestBody RefreshRequest request) {
        return ApiResponse.<RefreshResponse>builder()
                .result(authenticationService.refreshToken(request))
                .build();
    }

    @PostMapping("/introspect")
    public ApiResponse<IntrospectResponse> introspectToken(@RequestBody IntrospectRequest request) {
        return ApiResponse.<IntrospectResponse>builder()
                .result(authenticationService.introspectToken(request))
                .build();
    }

    @PostMapping("/logout")
    public ApiResponse<?> authenticate(@RequestBody LogoutRequest request) {
        authenticationService.logout(request);
        return ApiResponse.builder()
                .build();
    }
}

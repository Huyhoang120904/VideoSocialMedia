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
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class AuthenticationController {

    AuthenticationService authenticationService;

    @PostMapping("/token")
    public ResponseEntity<ApiResponse<AuthenticateResponse>> authenticate(@RequestBody AuthenticateRequest request) {
        return ResponseEntity.ok(ApiResponse.<AuthenticateResponse>builder()
                .result(authenticationService.authenticate(request))
                .build());
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<RefreshResponse>> authenticate(@RequestBody RefreshRequest request) {
        return ResponseEntity.ok(ApiResponse.<RefreshResponse>builder()
                .result(authenticationService.refreshToken(request))
                .build());
    }

    @PostMapping("/introspect")
    public ResponseEntity<ApiResponse<IntrospectResponse>> introspectToken(@RequestBody IntrospectRequest request) {
        return ResponseEntity.ok(ApiResponse.<IntrospectResponse>builder()
                .result(authenticationService.introspectToken(request))
                .build());
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> authenticate(@RequestBody LogoutRequest request) {
        authenticationService.logout(request);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .message("Logout successful")
                .build());
    }
}

package com.hehe.thesocial.service.authentication;

import com.hehe.thesocial.dto.request.auth.AuthenticateRequest;
import com.hehe.thesocial.dto.request.auth.IntrospectRequest;
import com.hehe.thesocial.dto.request.auth.LogoutRequest;
import com.hehe.thesocial.dto.request.auth.RefreshRequest;
import com.hehe.thesocial.dto.response.auth.IntrospectResponse;
import com.hehe.thesocial.dto.response.auth.AuthenticateResponse;
import com.hehe.thesocial.dto.response.auth.RefreshResponse;

public interface AuthenticationService {
    AuthenticateResponse authenticate(AuthenticateRequest request);
    IntrospectResponse introspectToken(IntrospectRequest request);
    RefreshResponse refreshToken(RefreshRequest request);
    void logout(LogoutRequest request);
}

package com.hehe.thesocial.service.authentication;

import com.hehe.thesocial.dto.request.auth.AuthenticateRequest;
import com.hehe.thesocial.dto.request.auth.IntrospectRequest;
import com.hehe.thesocial.dto.request.auth.LogoutRequest;
import com.hehe.thesocial.dto.request.auth.RefreshRequest;
import com.hehe.thesocial.dto.response.auth.AuthenticateResponse;
import com.hehe.thesocial.dto.response.auth.IntrospectResponse;
import com.hehe.thesocial.dto.response.auth.RefreshResponse;
import com.hehe.thesocial.entity.InvalidToken;
import com.hehe.thesocial.entity.Permission;
import com.hehe.thesocial.entity.User;
import com.hehe.thesocial.exception.AppException;
import com.hehe.thesocial.exception.ErrorCode;
import com.hehe.thesocial.repository.InvalidTokenRepository;
import com.hehe.thesocial.repository.UserRepository;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.StringJoiner;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationServiceImpl implements AuthenticationService {

    UserRepository userRepository;
    PasswordEncoder passwordEncoder;
    InvalidTokenRepository invalidTokenRepository;

    @NonFinal
    @Value("${jwt.expiration}")
    private long JWT_DURATION;


    @NonFinal
    @Value("${jwt.refreshable}")
    private long JWT_REFRESH_DURATION;

    @NonFinal
    @Value("${jwt.secret}")
    private String JWT_SECRET;

    @Override
    public AuthenticateResponse authenticate(AuthenticateRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        boolean isAuthenticated = passwordEncoder.matches(request.getPassword(), user.getPassword());

        if (!isAuthenticated) throw new AppException(ErrorCode.UNAUTHENTICATED);

        String token = generateToken(user);

        try {
            return AuthenticateResponse.builder()
                    .token(token)
                    .expireAt(verify(token, false).getJWTClaimsSet().getExpirationTime())
                    .build();
        } catch (ParseException | JOSEException e) {
            throw new RuntimeException(e);
        }
    }

    public IntrospectResponse introspectToken(IntrospectRequest request) {
        boolean isValid = true;
        String userId = null;
        try {
            SignedJWT signedJWT = verify(request.getToken(), false);
            userId = signedJWT.getJWTClaimsSet().getSubject();
        } catch (ParseException | JOSEException | AppException e) {
            isValid = false;
        }
        return IntrospectResponse.builder()
                .isValid(isValid)
                .userId(userId)
                .build();
    }

    @Override
    public RefreshResponse refreshToken(RefreshRequest request) {
        try {
            SignedJWT signedJWT = verify(request.getToken(), true);

            String jit = signedJWT.getJWTClaimsSet().getJWTID();
            Date expireAt = signedJWT.getJWTClaimsSet().getExpirationTime();

            InvalidToken invalidToken = InvalidToken.builder()
                    .id(jit)
                    .expireAt(expireAt)
                    .build();

            invalidTokenRepository.save(invalidToken);

            String usename = signedJWT.getJWTClaimsSet().getSubject();

            User userEntity = userRepository.findByUsername(usename)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
            String token = generateToken(userEntity);

            return RefreshResponse.builder()
                    .token(token)
                    .build();
        } catch (JOSEException | ParseException e) {
            throw new RuntimeException(e);
        }
    }

    @Transactional
    @Override
    public void logout(LogoutRequest request) {
        try {
            SignedJWT signedJWT = verify(request.getToken(), true);

            String jit = signedJWT.getJWTClaimsSet().getJWTID();
            Date expireAt = signedJWT.getJWTClaimsSet().getExpirationTime();

            InvalidToken invalidToken = InvalidToken.builder()
                    .id(jit)
                    .expireAt(expireAt)
                    .build();

            invalidTokenRepository.save(invalidToken);
        } catch (ParseException | JOSEException e) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
    }


    public SignedJWT verify(String token, boolean refresh) throws JOSEException, ParseException {
        JWSVerifier jwsVerifier = new MACVerifier(JWT_SECRET.getBytes());
        SignedJWT signedJWT = SignedJWT.parse(token);
        Date expireTime = refresh
                ? new Date(signedJWT.getJWTClaimsSet().getExpirationTime().toInstant()
                .plus(JWT_REFRESH_DURATION, ChronoUnit.SECONDS).toEpochMilli())
                : signedJWT.getJWTClaimsSet().getExpirationTime();

        boolean isVerify = signedJWT.verify(jwsVerifier);

        if (expireTime.before(new Date()) || !isVerify) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        String jit = signedJWT.getJWTClaimsSet().getJWTID();
        if (invalidTokenRepository.existsById(jit)) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        return signedJWT;
    }

    public String generateToken(User user) {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);
        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(user.getId())
                .issueTime(new Date())
                .issuer("TheSocial Auth System")
                .expirationTime(new Date(
                        Instant.now().plus(JWT_DURATION, ChronoUnit.SECONDS).toEpochMilli()
                ))
                .jwtID(UUID.randomUUID().toString())
                .claim("scope", buildScope(user))
                .build();

        Payload payload = new Payload(jwtClaimsSet.toJSONObject());

        JWSObject jwsObject = new JWSObject(header, payload);

        try {
            jwsObject.sign(new MACSigner(JWT_SECRET.getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException e) {
            throw new RuntimeException(e);
        }
    }

    private String buildScope(User user) {
        StringJoiner joiner = new StringJoiner("");
        if (!CollectionUtils.isEmpty(user.getRoles())) {
            user.getRoles().forEach(role -> {
                joiner.add("ROLE_" + role.getRoleName());
                if (!CollectionUtils.isEmpty(role.getPermissions())) {
                    role.getPermissions().stream().map(Permission::getPermission)
                            .forEach(joiner::add);
                }
            });
        }
        return joiner.toString();
    }

}

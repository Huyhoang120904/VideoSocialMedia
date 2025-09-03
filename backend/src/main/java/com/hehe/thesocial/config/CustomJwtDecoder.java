package com.hehe.thesocial.config;


import com.hehe.thesocial.dto.request.auth.IntrospectRequest;
import com.hehe.thesocial.dto.response.auth.IntrospectResponse;
import com.hehe.thesocial.service.authentication.AuthenticationService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Component;

import javax.crypto.spec.SecretKeySpec;
import java.util.Arrays;
import java.util.Objects;


@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CustomJwtDecoder implements JwtDecoder {

    @NonFinal
    @Value("${jwt.secret}")
    private String JWT_SECRET;


    @NonFinal
    NimbusJwtDecoder decoder = null;

    AuthenticationService authenticationService;

    @Override
    public Jwt decode(String token) throws JwtException {
        try {
            IntrospectResponse response = authenticationService.introspectToken(IntrospectRequest.builder().token(token).build());
            if (!response.isValid()) {
                throw new JwtException("Invalid Token");
            }


        } catch (JwtException e){
            log.error(Arrays.toString(e.getStackTrace()));
        }

        if (Objects.isNull(decoder)) {
            SecretKeySpec secretKeySpec = new SecretKeySpec(JWT_SECRET.getBytes(),"HS512");
            decoder = NimbusJwtDecoder.withSecretKey(secretKeySpec)
                    .macAlgorithm(MacAlgorithm.HS512)
                    .build();
        }

        return decoder.decode(token);
    }
}

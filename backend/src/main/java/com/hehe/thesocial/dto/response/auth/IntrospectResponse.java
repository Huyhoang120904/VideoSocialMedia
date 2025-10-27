package com.hehe.thesocial.dto.response.auth;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class IntrospectResponse {
    @JsonProperty("isValid")
    boolean valid;
    
    @JsonProperty("userId")
    String userId;
    
    public boolean isValid() {
        return valid;
    }
}

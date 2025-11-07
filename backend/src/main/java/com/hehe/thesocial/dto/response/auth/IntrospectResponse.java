package com.hehe.thesocial.dto.response.auth;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class IntrospectResponse {
    @JsonProperty("isValid")
    boolean valid;
    
    @JsonProperty("userId")
    String userId;
    
    public boolean isValid() {
        return valid;
    }
}

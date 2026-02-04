package com.demo.infrastructure.security;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class JwtService {

    private final JwtEncoder jwtEncoder;
    private final JwtDecoder jwtDecoder;

    public JwtService(JwtEncoder jwtEncoder, @Qualifier("jwtDecoder") JwtDecoder jwtDecoder) {
        this.jwtEncoder = jwtEncoder;
        this.jwtDecoder = jwtDecoder;
    }

    public String generateToken(String userId, String email, List<String> roles) {
        Instant now = Instant.now();
        int expiresIn = 60 * 60 * 24 * 7; // 7 days

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("web-project-demo")
                .subject(userId)
                .claim("email", email)
                .issuedAt(now)
                .expiresAt(now.plusSeconds(expiresIn))
                .claim("roles", roles)
                .build();

        return jwtEncoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();
    }

    public String getIdFromToken(String token) {
        token = token.replace("Bearer ", "");
        Jwt jwt = jwtDecoder.decode(token);
        return jwt.getSubject();
    }

    public String getEmailFromToken(String token) {
        token = token.replace("Bearer ", "");
        Jwt jwt = jwtDecoder.decode(token);
        return jwt.getClaimAsString("email");
    }

    public List<String> getRolesFromToken(String token) {
        token = token.replace("Bearer ", "");
        Jwt jwt = jwtDecoder.decode(token);
        return jwt.getClaimAsStringList("roles");
    }
}

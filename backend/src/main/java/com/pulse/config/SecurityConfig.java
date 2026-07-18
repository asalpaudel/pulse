package com.pulse.config;

import com.pulse.security.JwtAuthFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final CorsConfigurationSource corsConfigurationSource;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter, CorsConfigurationSource corsConfigurationSource) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.corsConfigurationSource = corsConfigurationSource;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        CookieCsrfTokenRepository csrfRepository = CookieCsrfTokenRepository.withHttpOnlyFalse();
        csrfRepository.setCookiePath("/");
        CsrfTokenRequestAttributeHandler csrfHandler = new CsrfTokenRequestAttributeHandler();
        csrfHandler.setCsrfRequestAttributeName("_csrf");
        http
                .csrf(csrf -> csrf
                        .csrfTokenRepository(csrfRepository)
                        .csrfTokenRequestHandler(csrfHandler)
                        .ignoringRequestMatchers(request -> {
                            String authorization = request.getHeader("Authorization");
                            return (authorization != null && authorization.startsWith("Bearer "))
                                    || request.getRequestURI().startsWith("/api/auth/mobile/");
                        }, request -> request.getRequestURI().startsWith("/ws")))
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .sessionManagement(sm -> sm
                        .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                        .sessionFixation(fixation -> fixation.migrateSession()))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/actuator/health").permitAll()
                        .requestMatchers("/actuator/**").hasRole("ADMIN")
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/i18n/**").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/newsletter/subscriptions").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/auth/csrf").permitAll()
                        .requestMatchers("/api/auth/register", "/api/auth/login", "/api/auth/session/login",
                                "/api/auth/session/verify-2fa", "/api/auth/session/verify-device", "/api/auth/verify-email",
                                "/api/auth/resend-verification", "/api/auth/forgot-password",
                                "/api/auth/reset-password", "/api/auth/mobile/login",
                                "/api/auth/mobile/verify-device").permitAll()
                        .requestMatchers("/ws/**").permitAll()
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .anyRequest().authenticated())
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((req, res, e) ->
                                writeError(res, HttpStatus.UNAUTHORIZED, "Authentication required"))
                        .accessDeniedHandler((req, res, e) ->
                                writeError(res, HttpStatus.FORBIDDEN, "Access denied")))
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    private void writeError(jakarta.servlet.http.HttpServletResponse res, HttpStatus status, String message)
            throws java.io.IOException {
        res.setStatus(status.value());
        res.setContentType("application/json");
        String json = "{\"timestamp\":\"" + java.time.Instant.now() + "\",\"status\":" + status.value()
                + ",\"error\":\"" + status.getReasonPhrase() + "\",\"message\":\"" + message + "\"}";
        res.getWriter().write(json);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}

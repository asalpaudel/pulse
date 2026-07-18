package com.pulse.controller;

import com.pulse.dto.AuthDtos.LoginRequest;
import com.pulse.entity.Role;
import com.pulse.security.UserPrincipal;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
class SessionAuthControllerTests {

    @Test
    void loginCreatesThirtyMinuteSessionForAnyRole() {
        UserPrincipal principal = new UserPrincipal(7L, "donor@pulse.test", "hash", Role.DONOR);
        AuthenticationManager manager = authentication ->
                UsernamePasswordAuthenticationToken.authenticated(
                        principal, null, principal.getAuthorities());

        SessionAuthController controller = new SessionAuthController(manager);
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        Map<String, Object> result = controller.login(
                new LoginRequest("donor@pulse.test", "secret"), request, response);

        assertThat(result).containsEntry("userId", 7L).containsEntry("role", Role.DONOR);
        assertThat(request.getSession(false)).isNotNull();
        assertThat(request.getSession(false).getMaxInactiveInterval()).isEqualTo(1800);
    }

    @Test
    void touchRequiresAnExistingSession() {
        SessionAuthController controller = new SessionAuthController(authentication -> authentication);
        MockHttpServletRequest request = new MockHttpServletRequest();

        assertThat(controller.touch(request).getStatusCode().value()).isEqualTo(401);

        request.getSession(true);
        assertThat(controller.touch(request).getStatusCode().value()).isEqualTo(204);
        assertThat(request.getSession(false).getAttribute("pulse.lastActivity")).isNotNull();
    }
}

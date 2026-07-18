package com.pulse.config;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class RequestCorrelationFilterTests {

    private final RequestCorrelationFilter filter = new RequestCorrelationFilter();

    @Test
    void preservesSafeClientCorrelationIds() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/test");
        request.addHeader(RequestCorrelationFilter.CORRELATION_HEADER, "pulse-request-123");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, new MockFilterChain());

        assertEquals("pulse-request-123", response.getHeader(RequestCorrelationFilter.CORRELATION_HEADER));
    }

    @Test
    void replacesUnsafeCorrelationIds() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/test");
        request.addHeader(RequestCorrelationFilter.CORRELATION_HEADER, "unsafe\nvalue");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, new MockFilterChain());

        String correlationId = response.getHeader(RequestCorrelationFilter.CORRELATION_HEADER);
        assertNotNull(correlationId);
        assertNotEquals("unsafe\nvalue", correlationId);
    }
}

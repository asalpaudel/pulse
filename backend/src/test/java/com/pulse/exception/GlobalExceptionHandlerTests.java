package com.pulse.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class GlobalExceptionHandlerTests {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void apiErrorsIncludeTheRequestPath() {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/donors/404");

        ResponseEntity<ErrorResponse> response = handler.handleApi(
                ApiException.notFound("Donor not found"), request);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Donor not found", response.getBody().message());
        assertEquals("/api/donors/404", response.getBody().path());
    }

    @Test
    void unexpectedErrorsDoNotLeakInternalDetails() {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/private");

        ResponseEntity<ErrorResponse> response = handler.handleGeneric(
                new RuntimeException("database password leaked"), request);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("An unexpected error occurred", response.getBody().message());
    }
}

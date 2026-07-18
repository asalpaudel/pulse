package com.pulse.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;
import java.util.regex.Pattern;

@Component
public class RequestCorrelationFilter extends OncePerRequestFilter {

    public static final String CORRELATION_HEADER = "X-Correlation-ID";
    private static final String MDC_KEY = "correlationId";
    private static final Pattern SAFE_ID = Pattern.compile("[A-Za-z0-9._-]{1,100}");
    private static final Logger log = LoggerFactory.getLogger(RequestCorrelationFilter.class);

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String correlationId = correlationId(request.getHeader(CORRELATION_HEADER));
        long startedAt = System.nanoTime();

        MDC.put(MDC_KEY, correlationId);
        response.setHeader(CORRELATION_HEADER, correlationId);
        try {
            filterChain.doFilter(request, response);
        } finally {
            long durationMs = (System.nanoTime() - startedAt) / 1_000_000;
            log.info("request method={} path={} status={} durationMs={}",
                    request.getMethod(), request.getRequestURI(), response.getStatus(), durationMs);
            MDC.remove(MDC_KEY);
        }
    }

    private String correlationId(String suppliedId) {
        if (suppliedId != null && SAFE_ID.matcher(suppliedId).matches()) {
            return suppliedId;
        }
        return UUID.randomUUID().toString();
    }
}

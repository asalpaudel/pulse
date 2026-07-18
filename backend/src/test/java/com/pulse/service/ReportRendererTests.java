package com.pulse.service;

import com.pulse.dto.SummaryReport;
import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertTrue;

class ReportRendererTests {

    private final ReportRenderer renderer = new ReportRenderer();
    private final SummaryReport report = new SummaryReport(
            Instant.parse("2026-01-01T00:00:00Z"),
            12,
            Map.of("DONOR", 10L, "HOSPITAL", 2L),
            5,
            Map.of("OPEN", 3L, "FULFILLED", 2L),
            24,
            4,
            9
    );

    @Test
    void rendersAValidPdfDocument() {
        byte[] pdf = renderer.pdf(report);

        assertTrue(pdf.length > 500);
        assertTrue(new String(pdf, 0, 5, StandardCharsets.US_ASCII).startsWith("%PDF-"));
    }

    @Test
    void rendersCsvWithHeadersAndData() {
        String csv = new String(renderer.csv(report), StandardCharsets.UTF_8);

        assertTrue(csv.startsWith("category,metric,value"));
        assertTrue(csv.contains("\"users_by_role\",\"DONOR\",\"10\""));
        assertTrue(csv.contains("\"overview\",\"blood_units_in_stock\",\"24\""));
    }
}

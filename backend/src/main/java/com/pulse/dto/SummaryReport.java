package com.pulse.dto;

import java.time.Instant;
import java.util.Map;

public record SummaryReport(
        Instant generatedAt,
        long totalUsers,
        Map<String, Long> usersByRole,
        long totalBloodRequests,
        Map<String, Long> requestsByStatus,
        long totalBloodUnitsInStock,
        long donationEvents,
        long eventEnrollments
) {
}

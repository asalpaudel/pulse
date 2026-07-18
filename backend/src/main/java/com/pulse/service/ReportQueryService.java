package com.pulse.service;

import com.pulse.dto.SummaryReport;
import com.pulse.entity.RequestStatus;
import com.pulse.entity.Role;
import com.pulse.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class ReportQueryService {

    private final UserRepository users;
    private final BloodRequestRepository bloodRequests;
    private final BloodStockRepository bloodStock;
    private final DonationEventRepository events;
    private final EventEnrollmentRepository enrollments;

    public ReportQueryService(
            UserRepository users,
            BloodRequestRepository bloodRequests,
            BloodStockRepository bloodStock,
            DonationEventRepository events,
            EventEnrollmentRepository enrollments
    ) {
        this.users = users;
        this.bloodRequests = bloodRequests;
        this.bloodStock = bloodStock;
        this.events = events;
        this.enrollments = enrollments;
    }

    @Transactional(readOnly = true)
    public SummaryReport summary() {
        Map<String, Long> usersByRole = new LinkedHashMap<>();
        Arrays.stream(Role.values()).forEach(role -> usersByRole.put(role.name(), users.countByRole(role)));

        Map<String, Long> requestsByStatus = new LinkedHashMap<>();
        Arrays.stream(RequestStatus.values()).forEach(status ->
                requestsByStatus.put(status.name(), bloodRequests.countByStatus(status)));

        long stockUnits = bloodStock.findAll().stream().mapToLong(stock -> stock.getUnits()).sum();
        return new SummaryReport(Instant.now(), users.count(), Map.copyOf(usersByRole), bloodRequests.count(),
                Map.copyOf(requestsByStatus), stockUnits, events.count(), enrollments.count());
    }
}

package com.pulse.controller;

import com.pulse.dto.SummaryReport;
import com.pulse.service.ReportQueryService;
import com.pulse.service.ReportRenderer;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
@PreAuthorize("hasAnyRole('ADMIN','STAFF','SUPER_ADMIN')")
public class ReportController {

    private final ReportQueryService reports;
    private final ReportRenderer renderer;

    public ReportController(ReportQueryService reports, ReportRenderer renderer) {
        this.reports = reports;
        this.renderer = renderer;
    }

    @GetMapping("/summary")
    public SummaryReport summary() {
        return reports.summary();
    }

    @GetMapping(value = "/summary.pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> pdf() {
        return download(renderer.pdf(reports.summary()), MediaType.APPLICATION_PDF, "pulse-summary.pdf");
    }

    @GetMapping(value = "/summary.csv", produces = "text/csv")
    public ResponseEntity<byte[]> csv() {
        return download(renderer.csv(reports.summary()), MediaType.parseMediaType("text/csv"), "pulse-summary.csv");
    }

    private ResponseEntity<byte[]> download(byte[] content, MediaType type, String filename) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(type);
        headers.setContentLength(content.length);
        headers.setContentDisposition(ContentDisposition.attachment().filename(filename).build());
        headers.setCacheControl("no-store");
        return ResponseEntity.ok().headers(headers).body(content);
    }
}

package com.pulse.service;

import com.lowagie.text.Document;
import com.lowagie.text.Font;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.pulse.dto.SummaryReport;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@Service
public class ReportRenderer {

    private static final DateTimeFormatter DATE_TIME = DateTimeFormatter
            .ofPattern("yyyy-MM-dd HH:mm:ss z").withZone(ZoneId.of("UTC"));

    public byte[] pdf(SummaryReport report) {
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 42, 42, 42, 42);
        PdfWriter.getInstance(document, output);
        document.open();

        document.add(new Paragraph("Pulse Platform Summary", new Font(Font.HELVETICA, 20, Font.BOLD)));
        document.add(new Paragraph("Generated: " + DATE_TIME.format(report.generatedAt())));
        document.add(new Paragraph(" "));

        PdfPTable table = new PdfPTable(new float[]{3, 1});
        table.setWidthPercentage(100);
        addHeader(table, "Metric", "Value");
        addRow(table, "Total users", report.totalUsers());
        report.usersByRole().forEach((role, count) -> addRow(table, "Users - " + role, count));
        addRow(table, "Total blood requests", report.totalBloodRequests());
        report.requestsByStatus().forEach((status, count) -> addRow(table, "Requests - " + status, count));
        addRow(table, "Blood units in stock", report.totalBloodUnitsInStock());
        addRow(table, "Donation events", report.donationEvents());
        addRow(table, "Event enrollments", report.eventEnrollments());
        document.add(table);
        document.close();
        return output.toByteArray();
    }

    public byte[] csv(SummaryReport report) {
        StringBuilder csv = new StringBuilder("category,metric,value\r\n");
        row(csv, "overview", "generated_at", report.generatedAt().toString());
        row(csv, "overview", "total_users", report.totalUsers());
        report.usersByRole().forEach((role, count) -> row(csv, "users_by_role", role, count));
        row(csv, "overview", "total_blood_requests", report.totalBloodRequests());
        report.requestsByStatus().forEach((status, count) -> row(csv, "requests_by_status", status, count));
        row(csv, "overview", "blood_units_in_stock", report.totalBloodUnitsInStock());
        row(csv, "overview", "donation_events", report.donationEvents());
        row(csv, "overview", "event_enrollments", report.eventEnrollments());
        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    private void addHeader(PdfPTable table, String... headings) {
        for (String heading : headings) {
            PdfPCell cell = new PdfPCell(new Paragraph(heading, new Font(Font.HELVETICA, 11, Font.BOLD)));
            cell.setBackgroundColor(new Color(235, 235, 235));
            cell.setPadding(7);
            table.addCell(cell);
        }
    }

    private void addRow(PdfPTable table, String label, long value) {
        table.addCell(label);
        table.addCell(Long.toString(value));
    }

    private void row(StringBuilder csv, String category, String metric, Object value) {
        csv.append(quoted(category)).append(',').append(quoted(metric)).append(',')
                .append(quoted(String.valueOf(value))).append("\r\n");
    }

    private String quoted(String value) {
        return '"' + value.replace("\"", "\"\"") + '"';
    }
}

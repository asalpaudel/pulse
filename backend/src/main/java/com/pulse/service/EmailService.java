package com.pulse.service;

import com.pulse.exception.ApiException;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.regex.Pattern;

@Service
public class EmailService {

    private static final Pattern SIX_DIGIT_CODE = Pattern.compile("\\d{6}");

    private final JavaMailSender mailSender;
    private final String fromAddress;
    private final String frontendUrl;

    public EmailService(
            JavaMailSender mailSender,
            @Value("${pulse.mail.from:no-reply@pulse.local}") String fromAddress,
            @Value("${pulse.frontend-url:http://localhost:5173}") String frontendUrl
    ) {
        this.mailSender = mailSender;
        this.fromAddress = validAddress(fromAddress);
        this.frontendUrl = frontendUrl;
    }

    public void sendVerificationCode(String recipient, String code) {
        requireCode(code);
        sendHtml(recipient, "Verify your Pulse account", """
                <h2>Verify your Pulse account</h2>
                <p>Your verification code is:</p>
                <p style="font-size:28px;font-weight:700;letter-spacing:6px">%s</p>
                <p>This code expires in 10 minutes. Never share it with anyone.</p>
                """.formatted(code));
    }

    public void sendNewDeviceCode(String recipient, String code) {
        requireCode(code);
        sendHtml(recipient, "New device sign-in code", """
                <h2>New device sign-in attempt</h2>
                <p>Use this code to finish signing in:</p>
                <p style="font-size:28px;font-weight:700;letter-spacing:6px">%s</p>
                <p>The code expires in 10 minutes. If this was not you, reset your password.</p>
                """.formatted(code));
    }

    public void sendWelcome(String recipient) {
        String safeUrl = escapeHtml(frontendUrl);
        sendHtml(recipient, "Welcome to Pulse", """
                <h2>Welcome to Pulse</h2>
                <p>Your account is verified and ready to use.</p>
                <p><a href="%s">Open Pulse</a></p>
                """.formatted(safeUrl));
    }

    public void sendHtml(String recipient, String subject, String htmlBody) {
        String safeRecipient = validAddress(recipient);
        if (subject == null || subject.isBlank() || subject.contains("\r") || subject.contains("\n")) {
            throw ApiException.badRequest("Invalid email subject");
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, StandardCharsets.UTF_8.name());
            helper.setFrom(fromAddress);
            helper.setTo(safeRecipient);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
        } catch (MailException | jakarta.mail.MessagingException ex) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Email delivery is temporarily unavailable");
        }
    }

    private String validAddress(String address) {
        try {
            InternetAddress parsed = new InternetAddress(address, true);
            parsed.validate();
            return parsed.getAddress();
        } catch (Exception ex) {
            throw ApiException.badRequest("Invalid email address");
        }
    }

    private void requireCode(String code) {
        if (code == null || !SIX_DIGIT_CODE.matcher(code).matches()) {
            throw new IllegalArgumentException("Email verification codes must contain six digits");
        }
    }

    private String escapeHtml(String value) {
        return value.replace("&", "&amp;").replace("<", "&lt;")
                .replace(">", "&gt;").replace("\"", "&quot;").replace("'", "&#39;");
    }
}

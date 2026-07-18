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
public class EmailService implements EmailGateway {

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
        sendHtml(recipient, "Verify your Pulse account", emailTemplate(
                "ACCOUNT VERIFICATION",
                "One quick step to join Pulse",
                "<p style=\"margin:0 0 22px;color:#475569;font-size:15px;line-height:1.7;\">Enter this code in Pulse to verify your email address and activate your account.</p>"
                        + codePanel(code)
                        + securityNote("This code expires in 10 minutes. Pulse will never ask you to share it."),
                "You received this email because an account was created using this address."
        ));
    }

    public void sendNewDeviceCode(String recipient, String code) {
        requireCode(code);
        sendHtml(recipient, "New device sign-in code", emailTemplate(
                "SECURITY CHECK",
                "New device sign-in",
                "<p style=\"margin:0 0 22px;color:#475569;font-size:15px;line-height:1.7;\">We noticed a sign-in from a new device. Use the code below to confirm it was you.</p>"
                        + codePanel(code)
                        + securityNote("The code expires in 10 minutes. If this was not you, reset your password immediately."),
                "This automated security message helps keep your Pulse account protected."
        ));
    }

    public void sendTwoFactorCode(String recipient, String code, String action) {
        requireCode(code);
        String safeAction = escapeHtml(action == null ? "continue" : action.toLowerCase());
        sendHtml(recipient, "Pulse security verification code", emailTemplate(
                "TWO-FACTOR AUTHENTICATION",
                "Confirm your security action",
                "<p style=\"margin:0 0 22px;color:#475569;font-size:15px;line-height:1.7;\">Use this verification code to <strong style=\"color:#172033;\">" + safeAction + "</strong>.</p>"
                        + codePanel(code)
                        + securityNote("This code expires in 10 minutes. If you did not request it, secure your account immediately."),
                "For your safety, never forward verification codes or enter them outside Pulse."
        ));
    }

    public void sendPasswordReset(String recipient, String resetUrl, long expiresInMinutes) {
        String safeUrl = escapeHtml(resetUrl);
        sendHtml(recipient, "Reset your Pulse password", emailTemplate(
                "PASSWORD RECOVERY",
                "Let’s get you back into Pulse",
                "<p style=\"margin:0 0 24px;color:#475569;font-size:15px;line-height:1.7;\">We received a request to reset your password. Use the secure button below to choose a new one.</p>"
                        + actionButton("Reset my password", safeUrl)
                        + securityNote("This link expires in " + expiresInMinutes + " minutes and works only once. If you did not request this, you can safely ignore this email.")
                        + fallbackLink(safeUrl),
                "This password recovery link was requested for your Pulse account."
        ));
    }

    public void sendWelcome(String recipient) {
        String safeUrl = escapeHtml(frontendUrl);
        sendHtml(recipient, "Welcome to Pulse", emailTemplate(
                "WELCOME TO THE COMMUNITY",
                "You’re ready to make an impact",
                "<p style=\"margin:0 0 24px;color:#475569;font-size:15px;line-height:1.7;\">Your account is verified. You can now discover blood requests, connect with the community, and help save lives.</p>"
                        + actionButton("Open Pulse", safeUrl),
                "Thank you for being part of a community built around giving."
        ));
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

    private String emailTemplate(String eyebrow, String title, String content, String footer) {
        return """
                <!doctype html>
                <html lang="en">
                  <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width,initial-scale=1">
                    <meta name="color-scheme" content="light only">
                    <title>%s</title>
                  </head>
                  <body style="margin:0;padding:0;background:#f4f1ee;font-family:'Segoe UI',Helvetica,Arial,sans-serif;color:#172033;">
                    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Secure account notification from Pulse.</div>
                    <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" border="0" style="background:#f4f1ee;">
                      <tr>
                        <td align="center" style="padding:40px 16px;">
                          <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;">
                            <tr>
                              <td style="padding:0 8px 18px;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                  <tr>
                                    <td style="width:38px;height:38px;border-radius:12px;background:#b4232f;color:#ffffff;text-align:center;font-size:20px;font-weight:800;">P</td>
                                    <td style="padding-left:11px;font-family:Georgia,'Times New Roman',serif;font-size:25px;font-weight:700;color:#172033;letter-spacing:-0.5px;">Pulse</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td style="background:#ffffff;border:1px solid #e5dfda;border-radius:22px;overflow:hidden;box-shadow:0 14px 36px rgba(31,24,20,0.08);">
                                <div style="height:7px;background:#b4232f;font-size:0;line-height:0;">&nbsp;</div>
                                <div style="padding:44px 46px 38px;">
                                  <p style="margin:0 0 12px;color:#b4232f;font-size:11px;font-weight:800;letter-spacing:1.8px;">%s</p>
                                  <h1 style="margin:0 0 18px;font-family:Georgia,'Times New Roman',serif;color:#172033;font-size:31px;line-height:1.18;letter-spacing:-0.6px;">%s</h1>
                                  %s
                                </div>
                                <div style="padding:21px 46px;background:#faf8f6;border-top:1px solid #eee9e5;">
                                  <p style="margin:0;color:#7a706a;font-size:12px;line-height:1.6;">%s</p>
                                </div>
                              </td>
                            </tr>
                            <tr>
                              <td align="center" style="padding:22px 24px 0;color:#8b817b;font-size:11px;line-height:1.6;">
                                Pulse · Connecting donors, saving lives<br>
                                This is an automated message—please do not reply.
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </body>
                </html>
                """.formatted(escapeHtml(title), escapeHtml(eyebrow), escapeHtml(title), content, escapeHtml(footer));
    }

    private String codePanel(String code) {
        return """
                <div style="margin:0 0 22px;padding:22px 16px;background:#fff7f7;border:1px solid #f1d3d6;border-radius:15px;text-align:center;">
                  <p style="margin:0 0 8px;color:#8b5a60;font-size:11px;font-weight:700;letter-spacing:1.4px;">YOUR VERIFICATION CODE</p>
                  <p style="margin:0;color:#a51d2a;font-family:'Courier New',monospace;font-size:34px;font-weight:800;letter-spacing:9px;line-height:1.2;">%s</p>
                </div>
                """.formatted(code);
    }

    private String actionButton(String label, String url) {
        return """
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 24px;">
                  <tr><td style="border-radius:12px;background:#b4232f;">
                    <a href="%s" style="display:inline-block;padding:14px 23px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:750;line-height:1;">%s&nbsp;&nbsp;→</a>
                  </td></tr>
                </table>
                """.formatted(url, escapeHtml(label));
    }

    private String securityNote(String message) {
        return """
                <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 4px;background:#f8f6f3;border-radius:12px;">
                  <tr>
                    <td style="width:20px;padding:15px 0 15px 16px;color:#b4232f;font-size:15px;vertical-align:top;">●</td>
                    <td style="padding:14px 16px 14px 9px;color:#625a55;font-size:12px;line-height:1.6;">%s</td>
                  </tr>
                </table>
                """.formatted(escapeHtml(message));
    }

    private String fallbackLink(String url) {
        return """
                <p style="margin:22px 0 6px;color:#7a706a;font-size:11px;line-height:1.5;">Button not working? Copy and paste this address into your browser:</p>
                <p style="margin:0;word-break:break-all;color:#9d2732;font-size:11px;line-height:1.5;">%s</p>
                """.formatted(url);
    }
}

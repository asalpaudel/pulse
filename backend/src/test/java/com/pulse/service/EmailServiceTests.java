package com.pulse.service;

import com.pulse.exception.ApiException;
import jakarta.mail.Message;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.Test;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import static org.junit.jupiter.api.Assertions.*;

class EmailServiceTests {

    @Test
    void createsACompleteVerificationEmail() throws Exception {
        CapturingMailSender sender = new CapturingMailSender();
        EmailService service = new EmailService(sender, "no-reply@pulse.test", "https://pulse.test");

        service.sendVerificationCode("donor@pulse.test", "123456");

        assertNotNull(sender.message);
        assertEquals("Verify your Pulse account", sender.message.getSubject());
        assertEquals("donor@pulse.test", sender.message.getRecipients(Message.RecipientType.TO)[0].toString());
        assertTrue(sender.message.getContent().toString().contains("123456"));
    }

    @Test
    void rejectsHeaderInjectionInSubjects() {
        EmailService service = new EmailService(new CapturingMailSender(),
                "no-reply@pulse.test", "https://pulse.test");

        ApiException error = assertThrows(ApiException.class,
                () -> service.sendHtml("donor@pulse.test", "Hello\nBcc: attacker@test", "body"));

        assertEquals(400, error.getStatus().value());
    }

    @Test
    void rejectsInvalidVerificationCodes() {
        EmailService service = new EmailService(new CapturingMailSender(),
                "no-reply@pulse.test", "https://pulse.test");

        assertThrows(IllegalArgumentException.class,
                () -> service.sendVerificationCode("donor@pulse.test", "123"));
    }

    @Test
    void createsPasswordResetEmailWithSecureLink() throws Exception {
        CapturingMailSender sender = new CapturingMailSender();
        EmailService service = new EmailService(sender, "no-reply@pulse.test", "https://pulse.test");

        service.sendPasswordReset("owner@pulse.test", "https://pulse.test/reset-password?token=safe-token", 15);

        assertEquals("Reset your Pulse password", sender.message.getSubject());
        assertTrue(sender.message.getContent().toString().contains("safe-token"));
        assertTrue(sender.message.getContent().toString().contains("15 minutes"));
    }

    private static class CapturingMailSender extends JavaMailSenderImpl {
        private MimeMessage message;

        @Override
        public void send(MimeMessage message) {
            this.message = message;
        }
    }
}

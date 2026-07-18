package com.pulse.service;

public interface EmailGateway {
    void sendVerificationCode(String recipient, String code);
    void sendNewDeviceCode(String recipient, String code);
    void sendTwoFactorCode(String recipient, String code, String action);
    void sendPasswordReset(String recipient, String resetUrl, long expiresInMinutes);
    void sendWelcome(String recipient);
}

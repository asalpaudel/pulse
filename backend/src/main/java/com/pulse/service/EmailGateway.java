package com.pulse.service;

public interface EmailGateway {
    void sendVerificationCode(String recipient, String code);
    void sendNewDeviceCode(String recipient, String code);
    void sendWelcome(String recipient);
}

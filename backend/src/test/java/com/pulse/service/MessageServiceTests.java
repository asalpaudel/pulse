package com.pulse.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.context.support.ResourceBundleMessageSource;

import java.nio.charset.StandardCharsets;
import java.util.Locale;

import static org.junit.jupiter.api.Assertions.assertEquals;

class MessageServiceTests {

    private MessageService messages;

    @BeforeEach
    void setUp() {
        ResourceBundleMessageSource source = new ResourceBundleMessageSource();
        source.setBasename("messages");
        source.setDefaultEncoding(StandardCharsets.UTF_8.name());
        source.setFallbackToSystemLocale(false);
        messages = new MessageService(source);
    }

    @Test
    void resolvesEnglishMessages() {
        assertEquals("Blood Requests", messages.get("nav.requests", Locale.ENGLISH));
    }

    @Test
    void resolvesNepaliMessages() {
        assertEquals("रगत अनुरोध", messages.get("nav.requests", Locale.forLanguageTag("ne")));
    }
}

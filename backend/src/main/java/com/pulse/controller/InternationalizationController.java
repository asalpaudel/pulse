package com.pulse.controller;

import com.pulse.service.MessageService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api/i18n")
public class InternationalizationController {

    private static final List<String> CLIENT_KEYS = List.of(
            "app.name",
            "nav.dashboard",
            "nav.profile",
            "nav.requests",
            "nav.events",
            "action.login",
            "action.logout",
            "action.save",
            "status.loading",
            "status.empty",
            "error.validation",
            "error.unexpected"
    );

    private final MessageService messages;

    public InternationalizationController(MessageService messages) {
        this.messages = messages;
    }

    @GetMapping("/messages")
    public Map<String, Object> messages(Locale locale) {
        Map<String, String> translations = new LinkedHashMap<>();
        CLIENT_KEYS.forEach(key -> translations.put(key, messages.get(key, locale)));
        return Map.of("locale", locale.toLanguageTag(), "messages", translations);
    }
}

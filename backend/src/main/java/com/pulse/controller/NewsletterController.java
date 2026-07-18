package com.pulse.controller;

import com.pulse.service.NewsletterService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/newsletter")
public class NewsletterController {
    private final NewsletterService newsletter;

    public NewsletterController(NewsletterService newsletter) {
        this.newsletter = newsletter;
    }

    public record SubscriptionRequest(
            @Email @NotBlank @Size(max = 320) String email,
            @Size(max = 100) String name,
            @Size(max = 40) String source
    ) {}

    @PostMapping("/subscriptions")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, String> subscribe(@Valid @RequestBody SubscriptionRequest request) {
        newsletter.subscribe(request.email(), request.name(), request.source());
        return Map.of("message", "You are subscribed to Pulse updates");
    }
}

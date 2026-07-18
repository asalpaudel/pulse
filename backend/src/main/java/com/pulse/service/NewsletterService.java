package com.pulse.service;

import com.pulse.entity.NewsletterSubscription;
import com.pulse.repository.NewsletterSubscriptionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Locale;

@Service
public class NewsletterService {
    private final NewsletterSubscriptionRepository subscriptions;

    public NewsletterService(NewsletterSubscriptionRepository subscriptions) {
        this.subscriptions = subscriptions;
    }

    @Transactional
    public void subscribe(String email, String name, String source) {
        String normalized = email.trim().toLowerCase(Locale.ROOT);
        NewsletterSubscription item = subscriptions.findByEmail(normalized)
                .orElseGet(NewsletterSubscription::new);
        item.setEmail(normalized);
        item.setName(clean(name));
        item.setSource(source == null || source.isBlank() ? "website" : source.trim().toLowerCase(Locale.ROOT));
        item.setActive(true);
        item.setSubscribedAt(Instant.now());
        subscriptions.save(item);
    }

    private String clean(String value) {
        if (value == null || value.isBlank()) return null;
        return value.trim();
    }
}

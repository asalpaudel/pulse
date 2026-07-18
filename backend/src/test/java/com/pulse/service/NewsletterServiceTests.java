package com.pulse.service;

import com.pulse.entity.NewsletterSubscription;
import com.pulse.repository.NewsletterSubscriptionRepository;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Proxy;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;

class NewsletterServiceTests {
    @Test
    void normalizesAndStoresSubscriptionsIdempotently() {
        AtomicReference<NewsletterSubscription> stored = new AtomicReference<>();
        NewsletterSubscriptionRepository repository = (NewsletterSubscriptionRepository) Proxy.newProxyInstance(
                getClass().getClassLoader(), new Class<?>[]{NewsletterSubscriptionRepository.class},
                (proxy, method, args) -> switch (method.getName()) {
                    case "findByEmail" -> Optional.ofNullable(stored.get());
                    case "save" -> { stored.set((NewsletterSubscription) args[0]); yield args[0]; }
                    case "toString" -> "NewsletterRepository";
                    default -> null;
                });
        NewsletterService service = new NewsletterService(repository);

        service.subscribe("  Donor@Pulse.Test ", "  Asha  ", "landing-popup");
        service.subscribe("donor@pulse.test", "Asha", "landing-popup");

        assertThat(stored.get().getEmail()).isEqualTo("donor@pulse.test");
        assertThat(stored.get().getName()).isEqualTo("Asha");
        assertThat(stored.get().isActive()).isTrue();
    }
}

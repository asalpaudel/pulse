package com.pulse.service;

import com.pulse.entity.BloodBank;
import com.pulse.entity.DonationEvent;
import com.pulse.entity.Hospital;
import com.pulse.exception.ApiException;
import com.pulse.repository.BloodBankRepository;
import com.pulse.repository.DonationEventRepository;
import com.pulse.repository.HospitalRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

/**
 * Central place that turns "Featured" placement on/off for the three monetizable
 * entities (hospital, blood bank, donation event). Called both by the admin
 * manual toggle and by {@link PaymentService} after a successful eSewa payment.
 */
@Service
public class FeatureService {

    /** Product kinds that can be purchased as a featured placement. */
    public enum FeatureTarget { HOSPITAL, BLOOD_BANK, EVENT }

    private final HospitalRepository hospitalRepository;
    private final BloodBankRepository bloodBankRepository;
    private final DonationEventRepository eventRepository;

    public FeatureService(HospitalRepository hospitalRepository,
                          BloodBankRepository bloodBankRepository,
                          DonationEventRepository eventRepository) {
        this.hospitalRepository = hospitalRepository;
        this.bloodBankRepository = bloodBankRepository;
        this.eventRepository = eventRepository;
    }

    public static FeatureTarget parseTarget(String raw) {
        try {
            return FeatureTarget.valueOf(raw.trim().toUpperCase());
        } catch (Exception e) {
            throw ApiException.badRequest("Unknown feature target: " + raw);
        }
    }

    /** Grant featured placement for {@code days} from now (used after a paid upgrade). */
    @Transactional
    public void grant(FeatureTarget target, Long id, int days) {
        Instant until = Instant.now().plus(days, ChronoUnit.DAYS);
        switch (target) {
            case HOSPITAL -> {
                Hospital h = hospitalRepository.findById(id)
                        .orElseThrow(() -> ApiException.notFound("Hospital not found"));
                h.setFeatured(true);
                h.setFeaturedUntil(until);
                hospitalRepository.save(h);
            }
            case BLOOD_BANK -> {
                BloodBank b = bloodBankRepository.findById(id)
                        .orElseThrow(() -> ApiException.notFound("Blood bank not found"));
                b.setFeatured(true);
                b.setFeaturedUntil(until);
                bloodBankRepository.save(b);
            }
            case EVENT -> {
                DonationEvent e = eventRepository.findById(id)
                        .orElseThrow(() -> ApiException.notFound("Donation event not found"));
                e.setFeatured(true);
                e.setFeaturedUntil(until);
                eventRepository.save(e);
            }
        }
    }

    /** Admin manual override — set featured true/false directly. */
    @Transactional
    public void setFeatured(FeatureTarget target, Long id, boolean featured) {
        switch (target) {
            case HOSPITAL -> {
                Hospital h = hospitalRepository.findById(id)
                        .orElseThrow(() -> ApiException.notFound("Hospital not found"));
                h.setFeatured(featured);
                h.setFeaturedUntil(featured ? Instant.now().plus(30, ChronoUnit.DAYS) : null);
                hospitalRepository.save(h);
            }
            case BLOOD_BANK -> {
                BloodBank b = bloodBankRepository.findById(id)
                        .orElseThrow(() -> ApiException.notFound("Blood bank not found"));
                b.setFeatured(featured);
                b.setFeaturedUntil(featured ? Instant.now().plus(30, ChronoUnit.DAYS) : null);
                bloodBankRepository.save(b);
            }
            case EVENT -> {
                DonationEvent e = eventRepository.findById(id)
                        .orElseThrow(() -> ApiException.notFound("Donation event not found"));
                e.setFeatured(featured);
                e.setFeaturedUntil(featured ? Instant.now().plus(30, ChronoUnit.DAYS) : null);
                eventRepository.save(e);
            }
        }
    }
}

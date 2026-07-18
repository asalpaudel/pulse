package com.pulse.controller;

import com.pulse.dto.PaymentDtos.InitiateRequest;
import com.pulse.dto.PaymentDtos.InitiateResponse;
import com.pulse.dto.PaymentDtos.PaymentDto;
import com.pulse.dto.PaymentDtos.VerifyRequest;
import com.pulse.entity.PaymentPurpose;
import com.pulse.exception.ApiException;
import com.pulse.security.SecurityUtil;
import com.pulse.service.BloodBankService;
import com.pulse.service.HospitalService;
import com.pulse.service.PaymentService;
import com.pulse.repository.DonationEventRepository;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

/**
 * Payments for featured placements (Tier 2). The server resolves the target from
 * the caller's own profile so a user can only pay to feature things they own.
 * Ad-campaign payments are initiated through {@code /api/ads} instead.
 */
@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;
    private final HospitalService hospitalService;
    private final BloodBankService bloodBankService;
    private final DonationEventRepository eventRepository;

    public PaymentController(PaymentService paymentService, HospitalService hospitalService,
                             BloodBankService bloodBankService, DonationEventRepository eventRepository) {
        this.paymentService = paymentService;
        this.hospitalService = hospitalService;
        this.bloodBankService = bloodBankService;
        this.eventRepository = eventRepository;
    }

    @PostMapping("/initiate")
    public InitiateResponse initiate(@Valid @RequestBody InitiateRequest req) {
        Long userId = SecurityUtil.currentUserId();
        PaymentPurpose purpose = req.purpose();
        Long targetId = switch (purpose) {
            case FEATURED_HOSPITAL -> hospitalService.requireByUserId(userId).getId();
            case FEATURED_BLOOD_BANK -> bloodBankService.requireByUserId(userId).getId();
            case FEATURED_EVENT -> {
                if (req.targetId() == null) throw ApiException.badRequest("Event id required");
                Long bankId = bloodBankService.requireByUserId(userId).getId();
                eventRepository.findById(req.targetId())
                        .filter(event -> event.getBloodBankId().equals(bankId))
                        .orElseThrow(() -> ApiException.forbidden("You can only feature your own event"));
                yield req.targetId();
            }
            case AD_CAMPAIGN -> throw ApiException.badRequest("Use /api/ads to pay for ad campaigns");
        };
        return paymentService.initiate(userId, purpose, targetId);
    }

    /** Called by the frontend callback after eSewa redirects back. */
    @PostMapping("/verify")
    public PaymentDto verify(@RequestBody VerifyRequest req) {
        if (!req.hasReference()) throw ApiException.badRequest("Payment confirmation is required");
        return PaymentDto.from(paymentService.verify(SecurityUtil.currentUserId(), req.data(), req.transactionUuid()));
    }
}

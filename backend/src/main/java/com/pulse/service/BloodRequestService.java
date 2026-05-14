package com.pulse.service;

import com.pulse.dto.RequestDtos.*;
import com.pulse.entity.*;
import com.pulse.exception.ApiException;
import com.pulse.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BloodRequestService {

    private static final double DEFAULT_RADIUS_KM = 15.0;

    private final BloodRequestRepository requestRepository;
    private final RequestResponseRepository responseRepository;
    private final DonorRepository donorRepository;
    private final BloodBankRepository bloodBankRepository;
    private final NotificationService notificationService;

    public BloodRequestService(BloodRequestRepository requestRepository,
                               RequestResponseRepository responseRepository,
                               DonorRepository donorRepository,
                               BloodBankRepository bloodBankRepository,
                               NotificationService notificationService) {
        this.requestRepository = requestRepository;
        this.responseRepository = responseRepository;
        this.donorRepository = donorRepository;
        this.bloodBankRepository = bloodBankRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public BloodRequestDto create(Long requesterUserId, CreateRequest req) {
        BloodRequest entity = BloodRequest.builder()
                .requesterUserId(requesterUserId)
                .bloodGroup(req.bloodGroup())
                .units(req.units())
                .urgency(req.urgency())
                .status(RequestStatus.OPEN)
                .latitude(req.latitude())
                .longitude(req.longitude())
                .note(req.note())
                .build();
        entity = requestRepository.save(entity);

        if (req.urgency() == Urgency.EMERGENCY) {
            dispatchEmergencyAlerts(entity, req.radiusKm());
        }
        return BloodRequestDto.from(entity);
    }

    /**
     * Emergency flow: find available donors matching the blood group within radius (haversine)
     * and nearby blood banks, create Notification rows and push them over WebSocket.
     */
    private void dispatchEmergencyAlerts(BloodRequest request, Double radiusKm) {
        double radius = radiusKm == null ? DEFAULT_RADIUS_KM : radiusKm;
        Double lat = request.getLatitude();
        Double lng = request.getLongitude();

        String msg = "EMERGENCY: " + request.getUnits() + " unit(s) of "
                + request.getBloodGroup() + " blood needed"
                + (request.getNote() != null ? " — " + request.getNote() : "");

        // Matching donors
        for (Donor donor : donorRepository.findByBloodGroupAndAvailableTrue(request.getBloodGroup())) {
            if (withinRadius(lat, lng, donor.getLatitude(), donor.getLongitude(), radius)) {
                notificationService.createAndPush(donor.getUserId(), msg, "EMERGENCY_REQUEST");
            }
        }

        // Nearby blood banks
        for (BloodBank bank : bloodBankRepository.findAll()) {
            if (withinRadius(lat, lng, bank.getLatitude(), bank.getLongitude(), radius)) {
                notificationService.createAndPush(bank.getUserId(), msg, "EMERGENCY_REQUEST");
            }
        }
    }

    private boolean withinRadius(Double lat1, Double lng1, Double lat2, Double lng2, double radius) {
        if (lat1 == null || lng1 == null) return true; // no request location: alert everyone matching
        Double dist = GeoUtil.distanceKmOrNull(lat1, lng1, lat2, lng2);
        return dist != null && dist <= radius;
    }

    @Transactional(readOnly = true)
    public List<BloodRequestDto> list(Long currentUserId, RequestStatus status, boolean mine) {
        List<BloodRequest> result;
        if (mine && status != null) {
            result = requestRepository.findByRequesterUserIdAndStatus(currentUserId, status);
        } else if (mine) {
            result = requestRepository.findByRequesterUserId(currentUserId);
        } else if (status != null) {
            result = requestRepository.findByStatus(status);
        } else {
            result = requestRepository.findAll();
        }
        return result.stream().map(BloodRequestDto::from).toList();
    }

    @Transactional(readOnly = true)
    public BloodRequestDto get(Long id) {
        return BloodRequestDto.from(require(id));
    }

    public BloodRequest require(Long id) {
        return requestRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Blood request not found"));
    }

    @Transactional
    public BloodRequestDto updateStatus(Long id, Long currentUserId, boolean isAdmin, RequestStatus status) {
        BloodRequest r = require(id);
        if (!isAdmin && !r.getRequesterUserId().equals(currentUserId)) {
            throw ApiException.forbidden("Only the request owner or an admin can change status");
        }
        r.setStatus(status);
        return BloodRequestDto.from(requestRepository.save(r));
    }

    @Transactional
    public RequestResponseDto respond(Long requestId, Long responderUserId, Role responderRole) {
        BloodRequest r = require(requestId);
        if (responseRepository.existsByBloodRequestIdAndResponderUserId(requestId, responderUserId)) {
            throw ApiException.conflict("You have already responded to this request");
        }
        RequestResponse response = RequestResponse.builder()
                .bloodRequestId(requestId)
                .responderUserId(responderUserId)
                .responderRole(responderRole)
                .status("OFFERED")
                .build();
        response = responseRepository.save(response);

        // Move request to MATCHED on first response
        if (r.getStatus() == RequestStatus.OPEN) {
            r.setStatus(RequestStatus.MATCHED);
            requestRepository.save(r);
        }
        // Notify the requester
        notificationService.createAndPush(r.getRequesterUserId(),
                responderRole + " offered to fulfil your " + r.getBloodGroup() + " request",
                "REQUEST_RESPONSE");

        return RequestResponseDto.from(response);
    }

    @Transactional(readOnly = true)
    public List<RequestResponseDto> listResponses(Long requestId, Long currentUserId, boolean isAdmin) {
        BloodRequest r = require(requestId);
        if (!isAdmin && !r.getRequesterUserId().equals(currentUserId)) {
            throw ApiException.forbidden("Only the request owner or an admin can view responses");
        }
        return responseRepository.findByBloodRequestId(requestId)
                .stream().map(RequestResponseDto::from).toList();
    }
}

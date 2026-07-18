package com.pulse.service;

import com.pulse.entity.BloodBank;
import com.pulse.entity.Donor;
import com.pulse.entity.Hospital;
import com.pulse.repository.BloodBankRepository;
import com.pulse.repository.DonorRepository;
import com.pulse.repository.HospitalRepository;
import com.pulse.entity.User;
import com.pulse.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

/** Resolves a human-readable display name for a user id across all profile types. */
@Service
public class NameResolver {

    private final HospitalRepository hospitalRepository;
    private final BloodBankRepository bloodBankRepository;
    private final DonorRepository donorRepository;
    private final UserRepository userRepository;

    public NameResolver(HospitalRepository hospitalRepository, BloodBankRepository bloodBankRepository,
                        DonorRepository donorRepository, UserRepository userRepository) {
        this.hospitalRepository = hospitalRepository;
        this.bloodBankRepository = bloodBankRepository;
        this.donorRepository = donorRepository;
        this.userRepository = userRepository;
    }

    public String nameFor(Long userId) {
        if (userId == null) return null;
        return hospitalRepository.findByUserId(userId).map(Hospital::getName)
                .or(() -> bloodBankRepository.findByUserId(userId).map(BloodBank::getName))
                .or(() -> donorRepository.findByUserId(userId).map(Donor::getFullName))
                .orElseGet(() -> userRepository.findById(userId)
                        .map(u -> emailPrefix(u.getEmail()))
                        .orElse("User #" + userId));
    }

    /**
     * Batch variant — resolves many user ids with a fixed number of queries
     * (one per profile type) instead of N×4. Use in list/loop rendering.
     */
    public Map<Long, String> namesFor(Collection<Long> userIds) {
        Map<Long, String> out = new HashMap<>();
        Set<Long> remaining = new HashSet<>();
        for (Long id : userIds) if (id != null) remaining.add(id);
        if (remaining.isEmpty()) return out;

        for (Hospital h : hospitalRepository.findByUserIdIn(remaining)) out.put(h.getUserId(), h.getName());
        remaining.removeAll(out.keySet());
        for (BloodBank b : bloodBankRepository.findByUserIdIn(remaining)) out.put(b.getUserId(), b.getName());
        remaining.removeAll(out.keySet());
        for (Donor d : donorRepository.findByUserIdIn(remaining)) out.put(d.getUserId(), d.getFullName());
        remaining.removeAll(out.keySet());
        for (User u : userRepository.findAllById(remaining)) out.put(u.getId(), emailPrefix(u.getEmail()));

        // Anything still unresolved gets a stable fallback.
        for (Long id : userIds) if (id != null) out.putIfAbsent(id, "User #" + id);
        return out;
    }

    private static String emailPrefix(String email) {
        if (email == null) return null;
        int at = email.indexOf('@');
        return at > 0 ? email.substring(0, at) : email;
    }
}

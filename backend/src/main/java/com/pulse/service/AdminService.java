package com.pulse.service;

import com.pulse.dto.UserDto;
import com.pulse.entity.*;
import com.pulse.exception.ApiException;
import com.pulse.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final HospitalRepository hospitalRepository;
    private final BloodBankRepository bloodBankRepository;
    private final BloodRequestRepository bloodRequestRepository;
    private final BloodStockRepository bloodStockRepository;

    public AdminService(UserRepository userRepository, HospitalRepository hospitalRepository,
                        BloodBankRepository bloodBankRepository, BloodRequestRepository bloodRequestRepository,
                        BloodStockRepository bloodStockRepository) {
        this.userRepository = userRepository;
        this.hospitalRepository = hospitalRepository;
        this.bloodBankRepository = bloodBankRepository;
        this.bloodRequestRepository = bloodRequestRepository;
        this.bloodStockRepository = bloodStockRepository;
    }

    @Transactional(readOnly = true)
    public List<UserDto> listUsers(Role role, Boolean verified) {
        List<User> users;
        if (role != null && verified != null) {
            users = userRepository.findByRoleAndVerified(role, verified);
        } else if (role != null) {
            users = userRepository.findByRole(role);
        } else if (verified != null) {
            users = userRepository.findByVerified(verified);
        } else {
            users = userRepository.findAll();
        }
        return users.stream().map(UserDto::from).toList();
    }

    @Transactional
    public UserDto verifyUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("User not found"));
        user.setVerified(true);
        userRepository.save(user);
        // Mirror verification onto the institutional profile.
        if (user.getRole() == Role.HOSPITAL) {
            hospitalRepository.findByUserId(userId).ifPresent(h -> {
                h.setVerified(true);
                hospitalRepository.save(h);
            });
        } else if (user.getRole() == Role.BLOOD_BANK) {
            bloodBankRepository.findByUserId(userId).ifPresent(b -> {
                b.setVerified(true);
                bloodBankRepository.save(b);
            });
        }
        return UserDto.from(user);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> stats() {
        Map<String, Long> usersByRole = new HashMap<>();
        for (Role r : Role.values()) {
            usersByRole.put(r.name(), userRepository.countByRole(r));
        }
        Map<String, Long> requestsByStatus = new HashMap<>();
        for (RequestStatus s : RequestStatus.values()) {
            requestsByStatus.put(s.name(), bloodRequestRepository.countByStatus(s));
        }
        long totalStock = bloodStockRepository.findAll().stream()
                .mapToLong(BloodStock::getUnits).sum();

        Map<String, Object> result = new HashMap<>();
        result.put("usersByRole", usersByRole);
        result.put("requestsByStatus", requestsByStatus);
        result.put("totalStock", totalStock);
        return result;
    }
}

package com.pulse.dto;

import com.pulse.entity.Role;
import com.pulse.entity.User;

import java.time.Instant;

public record UserDto(Long id, String email, Role role, boolean verified, Instant createdAt) {
    public static UserDto from(User u) {
        return new UserDto(u.getId(), u.getEmail(), u.getRole(), u.isVerified(), u.getCreatedAt());
    }
}

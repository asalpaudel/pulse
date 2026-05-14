package com.pulse.controller;

import com.pulse.dto.UserDto;
import com.pulse.entity.Role;
import com.pulse.service.AdminService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/users")
    public List<UserDto> users(@RequestParam(required = false) Role role,
                               @RequestParam(required = false) Boolean verified) {
        return adminService.listUsers(role, verified);
    }

    @PatchMapping("/users/{id}/verify")
    public UserDto verify(@PathVariable Long id) {
        return adminService.verifyUser(id);
    }

    @GetMapping("/stats")
    public Map<String, Object> stats() {
        return adminService.stats();
    }
}

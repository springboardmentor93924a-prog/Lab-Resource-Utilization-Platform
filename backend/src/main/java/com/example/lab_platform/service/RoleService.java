package com.example.lab_platform.service;

import com.example.lab_platform.entity.Role;
import com.example.lab_platform.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RoleService {

    @Autowired
    private RoleRepository roleRepository;

    // 1. Get all roles from the database
    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    // 2. Find a role by its ID
    public Optional<Role> getRoleById(Integer roleId) {
        return roleRepository.findById(roleId);
    }

    // 3. Save a new role to the database
    public Role saveRole(Role role) {
        return roleRepository.save(role);
    }
}
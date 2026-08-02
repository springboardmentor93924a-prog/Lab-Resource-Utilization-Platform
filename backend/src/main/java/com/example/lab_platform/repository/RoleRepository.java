package com.example.lab_platform.repository;

import com.example.lab_platform.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoleRepository extends JpaRepository<Role, Integer> {
    
     
    Role findByRoleName(String roleName);
}
package com.example.lab_platform.repository;

import com.example.lab_platform.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoleRepository extends JpaRepository<Role, Integer> {
    
    // चूंकि आपके Role.java में आईडी का डेटाटाइप Integer है, इसलिए यहाँ Long की जगह Integer रहेगा।
    // और फील्ड का नाम roleName है, इसलिए यह मेथड नाम से रोल ढूंढेगा:
    Role findByRoleName(String roleName);
}
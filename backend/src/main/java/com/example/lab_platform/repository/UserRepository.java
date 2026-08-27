package com.example.lab_platform.repository;

import com.example.lab_platform.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    // Login aur Email Validation ke liye zaroori query.
    // Case-insensitive + trims stored value, so accounts created before
    // email normalization was added (mixed-case, stray whitespace) can
    // still log in.
    @org.springframework.data.jpa.repository.Query(
        "SELECT u FROM User u WHERE LOWER(TRIM(u.email)) = LOWER(TRIM(:email))"
    )
    Optional<User> findByEmail(
        @org.springframework.data.repository.query.Param("email") String email
    );

    // Duplicate email check karne ke liye helper method
    @org.springframework.data.jpa.repository.Query(
        "SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END " +
        "FROM User u WHERE LOWER(TRIM(u.email)) = LOWER(TRIM(:email))"
    )
    Boolean existsByEmail(
        @org.springframework.data.repository.query.Param("email") String email
    );

    // Scopes the user-management list to one institution — used so
    // an Institution Admin/Lab Manager only sees their own
    // institution's users, not every institution's combined.
    java.util.List<User> findByInstitution_InstitutionId(Integer institutionId);

    // Scopes equipment-issue-report notifications to the department that
    // owns the equipment, rather than the whole institution — used by
    // EquipmentFeedbackServiceImpl so only the relevant department's
    // technicians/managers/dept head are notified.
    java.util.List<User> findByDepartment_DepartmentId(Integer departmentId);
}
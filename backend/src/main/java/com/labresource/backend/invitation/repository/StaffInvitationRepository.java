package com.labresource.backend.invitation.repository;

import com.labresource.backend.invitation.entity.StaffInvitation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StaffInvitationRepository extends JpaRepository<StaffInvitation, Long> {

    Optional<StaffInvitation> findByTokenHash(String tokenHash);

    List<StaffInvitation> findByInstitutionId(Long institutionId);

    List<StaffInvitation> findByInstitutionIdAndDepartmentId(Long institutionId, Long departmentId);

    List<StaffInvitation> findByInstitutionIdAndDepartmentIdAndRoleNameAndStatusIn(
            Long institutionId, Long departmentId, String roleName, List<String> statuses);

    Optional<StaffInvitation> findByEmailAndInstitutionIdAndDepartmentIdAndRoleNameAndStatus(
            String email, Long institutionId, Long departmentId, String roleName, String status);

    boolean existsByEmailAndStatusIn(String email, List<String> statuses);

    List<StaffInvitation> findByEmailAndStatus(String email, String status);

    boolean existsByPhoneNumberAndStatusIn(String phoneNumber, List<String> statuses);
}

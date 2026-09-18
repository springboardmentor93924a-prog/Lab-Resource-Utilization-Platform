package com.infosys.labresource.user.Repository;

import com.infosys.labresource.user.entites.Department;
import com.infosys.labresource.user.entites.Institution;
import com.infosys.labresource.user.entites.Role;
import com.infosys.labresource.user.entites.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserEntity,Long> {
    Optional<UserEntity> findByEmail(String email);
    List<UserEntity> findByInstitution(Institution institution);

    List<UserEntity> findByDepartment(Department department);
    boolean existsByEmail(String email);
    boolean existsByRole(Role role);

    boolean existsByInstitutionAndRole(Institution institution, Role role);
    List<UserEntity> findByIsActiveFalse();

    List<UserEntity> findByInstitutionAndIsActiveFalse(Institution institution);

    List<UserEntity> findByDepartmentAndIsActiveFalse(Department department);
    List<UserEntity> findByDepartmentAndRole(Department department, Role role);

    List<UserEntity> findByDepartmentAndInstitution(Department department, Institution institution);
}

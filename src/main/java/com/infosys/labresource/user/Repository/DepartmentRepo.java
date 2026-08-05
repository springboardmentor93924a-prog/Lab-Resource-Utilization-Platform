package com.infosys.labresource.user.Repository;

import com.infosys.labresource.user.entites.Department;
import com.infosys.labresource.user.entites.Institution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentRepo extends JpaRepository<Department,Long> {
    Optional<Department> findByDepartmentName(String DepartName);


List<Department> findByInstitution(Institution institution);
}

package com.infosys.labresource.user.Repository;

import com.infosys.labresource.user.entites.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DepartmentRepo extends JpaRepository<Department,Long> {

}

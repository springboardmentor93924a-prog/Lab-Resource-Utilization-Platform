package com.labplatform.repository;

import com.labplatform.entity.MaintenanceTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MaintenanceTaskRepository extends JpaRepository<MaintenanceTask, Long> {}
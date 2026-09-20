package com.labresource.backend.repository;

import com.labresource.backend.entity.Utilization;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UtilizationRepository extends JpaRepository<Utilization,Integer> {

}
package com.example.lab_platform.repository;

import com.example.lab_platform.entity.ChargebackRequest;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChargebackRequestRepository extends JpaRepository<ChargebackRequest, Integer> {

    Optional<ChargebackRequest> findByUsageCost_UsageCostId(Integer usageCostId);

    boolean existsByUsageCost_UsageCostId(Integer usageCostId);

    List<ChargebackRequest> findByPayerDepartment_DepartmentIdAndStatus(
            Integer departmentId, String status);

    List<ChargebackRequest> findByPayerInstitution_InstitutionIdAndStatus(
            Integer institutionId, String status);
}
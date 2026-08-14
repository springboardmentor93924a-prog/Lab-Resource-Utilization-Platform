package com.labplatform.billing.repository;

import com.labplatform.billing.model.BillingRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BillingRecordRepository extends JpaRepository<BillingRecord, Integer> {

    List<BillingRecord> findByBilledInstitutionId(Integer institutionId);

    List<BillingRecord> findByOwningInstitutionId(Integer institutionId);
}
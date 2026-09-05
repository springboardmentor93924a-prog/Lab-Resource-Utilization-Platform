package com.example.lab_platform.repository;

import com.example.lab_platform.entity.InvoiceLineItem;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InvoiceLineItemRepository extends JpaRepository<InvoiceLineItem, Integer> {

    boolean existsByChargeback_ChargebackId(Integer chargebackId);
}
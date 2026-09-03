package com.example.lab_platform.repository;

import com.example.lab_platform.entity.Invoice;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Integer> {

    long countByInvoiceNumberStartingWith(String prefix);
}
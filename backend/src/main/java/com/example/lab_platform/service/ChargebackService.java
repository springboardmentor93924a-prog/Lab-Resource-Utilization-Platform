package com.example.lab_platform.service;

import com.example.lab_platform.dto.ChargebackDTO;

import java.util.List;

public interface ChargebackService {

    // Scans unpaid department cost allocations and approved
    // inter-institution sharing requests, creating a chargeback for
    // anything that doesn't already have one. Idempotent.
    int generateChargebacks();

    List<ChargebackDTO> getAllChargebacks();

    ChargebackDTO approve(Integer chargebackId);

    ChargebackDTO dispute(Integer chargebackId, String remarks);

    ChargebackDTO settle(Integer chargebackId);
}
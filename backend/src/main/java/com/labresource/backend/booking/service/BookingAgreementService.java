package com.labresource.backend.booking.service;

import com.labresource.backend.booking.dto.BookingAgreementDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookingAgreementService {

    @Value("${app.booking.agreement.version:2026.1}")
    private String currentVersion;

    @Value("${app.booking.agreement.title:Institutional Laboratory Resource Usage Agreement}")
    private String agreementTitle;

    public BookingAgreementDto getCurrentAgreement() {
        return BookingAgreementDto.builder()
                .version(currentVersion)
                .title(agreementTitle)
                .summary("Standard institutional laboratory equipment usage policy and safety protocols.")
                .terms(List.of(
                        "I agree to adhere strictly to all standard laboratory safety protocols and operating standard operating procedures (SOPs).",
                        "I confirm that I have completed the required prerequisite safety orientation for this laboratory and equipment.",
                        "I understand that bookings must be operated during the reserved window and unattended sessions must be authorized by the lab technician/manager.",
                        "Any damage, malfunction, or unexpected equipment behavior must be reported immediately via the incident reporting portal."
                ))
                .required(true)
                .build();
    }

    public boolean isValidVersion(String version) {
        return currentVersion != null && currentVersion.equalsIgnoreCase(version != null ? version.trim() : "");
    }

    public String getCurrentVersion() {
        return currentVersion;
    }
}

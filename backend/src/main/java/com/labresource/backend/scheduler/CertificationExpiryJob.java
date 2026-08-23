package com.labresource.backend.scheduler;

import com.labresource.backend.certification.entity.EquipmentCertification;
import com.labresource.backend.certification.repository.EquipmentCertificationRepository;
import com.labresource.backend.equipment.entity.Equipment;
import com.labresource.backend.equipment.repository.EquipmentRepository;
import com.labresource.backend.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

/**
 * Checks equipment certification expiry dates daily and sends notifications only
 * at milestone intervals: 30, 15, 7, 1 day(s) before expiry, and exactly ONCE
 * on the expiration day (CERTIFICATION_EXPIRED) — duplicate-protected.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class CertificationExpiryJob {

    private static final int[] REMINDER_DAYS = {30, 15, 7, 1};

    private final EquipmentCertificationRepository certificationRepository;
    private final EquipmentRepository equipmentRepository;
    private final NotificationService notificationService;

    @Scheduled(cron = "0 0 7 * * *") // run daily at 7:00 AM
    public void checkCertifications() {
        log.info("Running CertificationExpiryJob...");
        LocalDate today = LocalDate.now();

        List<EquipmentCertification> activeCerts =
                certificationRepository.findByStatus(EquipmentCertification.VALID);

        // Also check EXPIRING_SOON ones that haven't been marked EXPIRED yet
        List<EquipmentCertification> expiringSoon =
                certificationRepository.findByStatus(EquipmentCertification.EXPIRING_SOON);

        processGroup(activeCerts, today);
        processGroup(expiringSoon, today);
    }

    private void processGroup(List<EquipmentCertification> certs, LocalDate today) {
        for (EquipmentCertification cert : certs) {
            LocalDate expiryDate = cert.getExpiryDate();
            long daysRemaining = today.until(expiryDate).getDays();

            Equipment equipment = equipmentRepository.findById(cert.getEquipmentId()).orElse(null);
            if (equipment == null) continue;

            Long deptId = equipment.getDepartmentId();

            if (daysRemaining < 0) {
                // Past expiry — mark as EXPIRED (once) and notify
                if (!EquipmentCertification.EXPIRED.equals(cert.getStatus())) {
                    cert.setStatus(EquipmentCertification.EXPIRED);
                    certificationRepository.save(cert);

                    String dedupKey = "CERT-" + cert.getCertificationId() + "-EXPIRED";
                    sendIfAbsent(deptId, "CERTIFICATION_EXPIRED", dedupKey,
                            "Certification Expired: " + equipment.getName(),
                            "Certification \"" + cert.getCertificateName() + "\" for \"" + equipment.getName()
                                    + "\" expired on " + expiryDate + ". Immediate renewal required.");
                }
            } else if (daysRemaining == 0) {
                // Expiring today
                String dedupKey = "CERT-" + cert.getCertificationId() + "-DUE0";
                sendIfAbsent(deptId, "CERTIFICATION_EXPIRING_SOON", dedupKey,
                        "Certification Expires Today: " + equipment.getName(),
                        "Certification \"" + cert.getCertificateName() + "\" for \"" + equipment.getName()
                                + "\" expires today. Please renew immediately.");
                cert.setStatus(EquipmentCertification.EXPIRING_SOON);
                certificationRepository.save(cert);

            } else {
                // Check milestone reminders
                for (int days : REMINDER_DAYS) {
                    if (daysRemaining == days) {
                        String dedupKey = "CERT-" + cert.getCertificationId() + "-" + days + "D";
                        sendIfAbsent(deptId, "CERTIFICATION_EXPIRING_SOON", dedupKey,
                                "Certification Expiring in " + days + " Day(s): " + equipment.getName(),
                                "Certification \"" + cert.getCertificateName() + "\" for \"" + equipment.getName()
                                        + "\" expires on " + expiryDate + " (" + days + " day(s) remaining).");
                        cert.setStatus(EquipmentCertification.EXPIRING_SOON);
                        certificationRepository.save(cert);
                        break;
                    }
                }
            }
        }
    }

    private void sendIfAbsent(Long deptId, String type, String dedupKey, String title, String message) {
        notificationService.notifyDepartmentLabManagers(deptId, type, dedupKey, message);
        notificationService.notifyDepartmentHeads(deptId, type, dedupKey, message);
        log.info("CertificationExpiryJob: sent [{}] for department {}", type, deptId);
    }
}

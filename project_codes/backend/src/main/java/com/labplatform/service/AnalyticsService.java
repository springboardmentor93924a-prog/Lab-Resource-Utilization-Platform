package com.labplatform.service;

import com.labplatform.entity.*;
import com.labplatform.repository.BookingRepository;
import com.labplatform.repository.EquipmentRepository;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final EquipmentRepository equipmentRepository;
    private final BookingRepository bookingRepository;

    @Data
    @AllArgsConstructor
    public static class UtilizationSummary {
        private Long equipmentId;
        private String equipmentName;
        private double utilizationRatePercent; // booked hours / available hours in window
        private long totalBookings;
        private long completedBookings;
        private long noShowBookings;
        private double idleHours;
    }

    /** Utilization rate = actual used hours / window hours, for a given equipment over [from, to]. */
    public UtilizationSummary utilizationFor(Long equipmentId, LocalDateTime from, LocalDateTime to) {
        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new IllegalArgumentException("Equipment not found"));

        List<Booking> bookings = bookingRepository.findByEquipmentIdAndStartTimeBetween(equipmentId, from, to);

        double windowHours = Duration.between(from, to).toMinutes() / 60.0;
        double usedHours = bookings.stream()
                .filter(b -> b.getActualStartTime() != null && b.getActualEndTime() != null)
                .mapToDouble(b -> Duration.between(b.getActualStartTime(), b.getActualEndTime()).toMinutes() / 60.0)
                .sum();

        long completed = bookings.stream().filter(b -> b.getStatus() == BookingStatus.COMPLETED).count();
        long noShow = bookings.stream().filter(b -> b.getStatus() == BookingStatus.NO_SHOW).count();

        double rate = windowHours > 0 ? Math.min(100.0, (usedHours / windowHours) * 100.0) : 0;

        return new UtilizationSummary(equipment.getId(), equipment.getName(), round(rate),
                bookings.size(), completed, noShow, round(Math.max(0, windowHours - usedHours)));
    }

    /** Utilization heatmap across all equipment in an institution for a window. */
    public List<UtilizationSummary> heatmapForInstitution(Long institutionId, LocalDateTime from, LocalDateTime to) {
        return equipmentRepository.findByInstitutionId(institutionId).stream()
                .map(e -> utilizationFor(e.getId(), from, to))
                .sorted(Comparator.comparingDouble(UtilizationSummary::getUtilizationRatePercent).reversed())
                .collect(Collectors.toList());
    }

    /** Flags equipment with utilization below threshold — candidates for idle alerts / procurement review. */
    public List<UtilizationSummary> idleEquipment(Long institutionId, LocalDateTime from, LocalDateTime to, double thresholdPercent) {
        return heatmapForInstitution(institutionId, from, to).stream()
                .filter(u -> u.getUtilizationRatePercent() < thresholdPercent)
                .collect(Collectors.toList());
    }

    @Data
    @AllArgsConstructor
    public static class DashboardSummary {
        private long totalEquipment;
        private long availableEquipment;
        private long underMaintenanceEquipment;
        private long pendingBookings;
        private long activeBookings;
        private double averageUtilizationPercent;
    }

    public DashboardSummary institutionDashboard(Long institutionId, LocalDateTime from, LocalDateTime to) {
        List<Equipment> equipmentList = equipmentRepository.findByInstitutionId(institutionId);
        long total = equipmentList.size();
        long available = equipmentList.stream().filter(e -> e.getStatus() == EquipmentStatus.AVAILABLE).count();
        long underMaintenance = equipmentList.stream().filter(e -> e.getStatus() == EquipmentStatus.UNDER_MAINTENANCE).count();

        List<UtilizationSummary> heatmap = heatmapForInstitution(institutionId, from, to);
        double avgUtil = heatmap.stream().mapToDouble(UtilizationSummary::getUtilizationRatePercent).average().orElse(0);

        long pending = 0, active = 0;
        for (Equipment e : equipmentList) {
            List<Booking> bookings = bookingRepository.findByEquipmentId(e.getId());
            pending += bookings.stream().filter(b -> b.getStatus() == BookingStatus.PENDING_APPROVAL).count();
            active += bookings.stream().filter(b -> b.getStatus() == BookingStatus.IN_USE).count();
        }

        return new DashboardSummary(total, available, underMaintenance, pending, active, round(avgUtil));
    }

    private double round(double val) {
        return Math.round(val * 100) / 100.0;
    }
}

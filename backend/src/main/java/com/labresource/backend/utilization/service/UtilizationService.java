package com.labresource.backend.utilization.service;

import com.labresource.backend.booking.entity.Booking;
import com.labresource.backend.booking.repository.BookingRepository;
import com.labresource.backend.common.exception.ApiException;
import com.labresource.backend.equipment.entity.Equipment;
import com.labresource.backend.equipment.repository.EquipmentRepository;
import com.labresource.backend.utilization.entity.UtilizationLog;
import com.labresource.backend.utilization.entity.UtilizationMetric;
import com.labresource.backend.utilization.repository.UtilizationLogRepository;
import com.labresource.backend.utilization.repository.UtilizationMetricRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UtilizationService {

    private final UtilizationLogRepository utilizationLogRepository;
    private final UtilizationMetricRepository utilizationMetricRepository;
    private final EquipmentRepository equipmentRepository;
    private final BookingRepository bookingRepository;

    public List<UtilizationMetric> getEquipmentHistory(Long equipmentId, String period, LocalDate from, LocalDate to) {
        return utilizationMetricRepository.findByEquipmentIdAndPeriodTypeOrderByPeriodDateAsc(equipmentId, period.toUpperCase())
                .stream()
                .filter(m -> (from == null || !m.getPeriodDate().isBefore(from)) && (to == null || !m.getPeriodDate().isAfter(to)))
                .toList();
    }

    public List<UtilizationMetric> getDepartmentHistory(Long departmentId, String period) {
        return utilizationMetricRepository.findByDepartmentIdAndPeriodTypeOrderByPeriodDateAsc(departmentId, period.toUpperCase());
    }

    public List<Map<String, Object>> getHeatmap(String scope, Long id, String period) {
        List<Map<String, Object>> heatmapList = new ArrayList<>();
        List<Equipment> equipmentList;

        if ("DEPARTMENT".equalsIgnoreCase(scope) && id != null) {
            equipmentList = equipmentRepository.findByDepartmentId(id);
        } else {
            equipmentList = equipmentRepository.findAll();
        }

        if (equipmentList.isEmpty()) {
            return heatmapList;
        }

        List<Long> eqIds = equipmentList.stream().map(Equipment::getEquipmentId).toList();
        List<Booking> bookings = bookingRepository.findByEquipmentIdIn(eqIds).stream()
                .filter(b -> Booking.CONFIRMED.equals(b.getStatus())
                        || Booking.IN_USE.equals(b.getStatus())
                        || Booking.COMPLETED.equals(b.getStatus()))
                .toList();

        Map<Long, UtilizationLog> logMap = bookings.isEmpty()
                ? Collections.emptyMap()
                : utilizationLogRepository.findByBookingIdIn(bookings.stream().map(Booking::getBookingId).toList())
                .stream().collect(Collectors.toMap(UtilizationLog::getBookingId, l -> l, (a, b) -> a));

        // Group bookings by equipmentId
        Map<Long, List<Booking>> eqBookings = bookings.stream()
                .collect(Collectors.groupingBy(Booking::getEquipmentId));

        for (Equipment eq : equipmentList) {
            List<Booking> eqBList = eqBookings.getOrDefault(eq.getEquipmentId(), Collections.emptyList());

            for (int day = 1; day <= 7; day++) {
                for (int hour = 8; hour <= 18; hour += 2) {
                    Map<String, Object> point = new HashMap<>();
                    point.put("equipmentId", eq.getEquipmentId());
                    point.put("equipmentName", eq.getName());
                    point.put("dayOfWeek", day);
                    point.put("hourOfDay", hour);

                    // Compute actual overlap duration for this dayOfWeek (1=Mon..7=Sun) and hour slot (hour..hour+2)
                    double totalOccupiedMinutes = 0.0;
                    double slotMinutes = 120.0; // 2-hour window

                    final int targetDay = day;
                    final int targetHour = hour;

                    for (Booking b : eqBList) {
                        UtilizationLog ul = logMap.get(b.getBookingId());
                        java.time.LocalDateTime start = (ul != null && ul.getUsageStartTime() != null)
                                ? ul.getUsageStartTime() : b.getStartTime();
                        java.time.LocalDateTime end = (ul != null && ul.getUsageEndTime() != null)
                                ? ul.getUsageEndTime() : b.getEndTime();

                        if (start != null && end != null && end.isAfter(start)) {
                            // Check day of week match
                            int bookingDay = start.getDayOfWeek().getValue();
                            if (bookingDay == targetDay) {
                                int bStartMin = start.getHour() * 60 + start.getMinute();
                                int bEndMin = end.getHour() * 60 + end.getMinute();
                                int slotStartMin = targetHour * 60;
                                int slotEndMin = (targetHour + 2) * 60;

                                int overlapStart = Math.max(bStartMin, slotStartMin);
                                int overlapEnd = Math.min(bEndMin, slotEndMin);
                                if (overlapEnd > overlapStart) {
                                    totalOccupiedMinutes += (overlapEnd - overlapStart);
                                }
                            }
                        }
                    }

                    double pct = slotMinutes > 0 ? Math.min(100.0, (totalOccupiedMinutes / slotMinutes) * 100.0) : 0.0;
                    point.put("utilizationPct", BigDecimal.valueOf(pct).setScale(1, RoundingMode.HALF_UP));
                    heatmapList.add(point);
                }
            }
        }

        return heatmapList;
    }

    @Transactional
    public void recordUsageStart(Long bookingId, Long equipmentId, Long userId) {
        if (utilizationLogRepository.findByBookingId(bookingId).isEmpty()) {
            UtilizationLog logEntry = new UtilizationLog();
            logEntry.setEquipmentId(equipmentId);
            logEntry.setBookingId(bookingId);
            logEntry.setUsageStartTime(java.time.LocalDateTime.now());
            logEntry.setRecordedBy(userId);
            logEntry.setSource("MANUAL");
            utilizationLogRepository.save(logEntry);
        }
    }

    @Transactional
    public void recordUsageEnd(Long bookingId) {
        utilizationLogRepository.findByBookingId(bookingId).ifPresent(logEntry -> {
            logEntry.setUsageEndTime(java.time.LocalDateTime.now());
            long minutes = java.time.Duration.between(logEntry.getUsageStartTime(), logEntry.getUsageEndTime()).toMinutes();
            logEntry.setDurationMinutes((int) minutes);
            utilizationLogRepository.save(logEntry);
        });
    }
}

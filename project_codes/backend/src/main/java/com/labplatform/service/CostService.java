package com.labplatform.service;

import com.labplatform.entity.Booking;
import com.labplatform.entity.CostRecord;
import com.labplatform.entity.Equipment;
import com.labplatform.repository.CostRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CostService {

    private final CostRecordRepository costRecordRepository;

    public CostRecord recordCharge(Booking booking, Equipment equipment, String department, BigDecimal amount, String chargeType) {
        CostRecord record = CostRecord.builder()
                .booking(booking).equipment(equipment).department(department)
                .amount(amount).chargeType(chargeType)
                .build();
        return costRecordRepository.save(record);
    }

    /** Called when a booking completes — charges for actual usage time at the equipment's hourly rate. */
    public CostRecord chargeForCompletedBooking(Booking booking) {
        if (booking.getActualStartTime() == null || booking.getActualEndTime() == null
                || booking.getEquipment().getHourlyUsageCost() == null) {
            return null;
        }
        double hours = Duration.between(booking.getActualStartTime(), booking.getActualEndTime()).toMinutes() / 60.0;
        BigDecimal amount = booking.getEquipment().getHourlyUsageCost().multiply(BigDecimal.valueOf(hours));

        String department = booking.getRequestedBy().getDepartment();
        return recordCharge(booking, booking.getEquipment(), department, amount, "USAGE");
    }

    public List<CostRecord> forEquipment(Long equipmentId) {
        return costRecordRepository.findByEquipmentId(equipmentId);
    }

    public List<CostRecord> forDepartment(String department) {
        return costRecordRepository.findByDepartment(department);
    }

    public List<CostRecord> all() {
        return costRecordRepository.findAll();
    }
}

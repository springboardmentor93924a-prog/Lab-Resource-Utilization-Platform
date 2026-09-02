package com.labresource.service.impl;

import com.labresource.dto.SystemMonitoringResponseDto;
import com.labresource.repository.BookingRepository;
import com.labresource.repository.EquipmentRepository;
import com.labresource.repository.MaintenanceRecordRepository;
import com.labresource.repository.NotificationRepository;
import com.labresource.repository.UserRepository;
import com.labresource.service.SystemMonitoringService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class SystemMonitoringServiceImpl implements SystemMonitoringService {

    private final UserRepository userRepository;
    private final EquipmentRepository equipmentRepository;
    private final BookingRepository bookingRepository;
    private final MaintenanceRecordRepository maintenanceRecordRepository;
    private final NotificationRepository notificationRepository;

    public SystemMonitoringServiceImpl(
            UserRepository userRepository,
            EquipmentRepository equipmentRepository,
            BookingRepository bookingRepository,
            MaintenanceRecordRepository maintenanceRecordRepository,
            NotificationRepository notificationRepository
    ) {
        this.userRepository = userRepository;
        this.equipmentRepository = equipmentRepository;
        this.bookingRepository = bookingRepository;
        this.maintenanceRecordRepository = maintenanceRecordRepository;
        this.notificationRepository = notificationRepository;
    }

    @Override
    public SystemMonitoringResponseDto getSystemMonitoringSummary() {
        SystemMonitoringResponseDto response = new SystemMonitoringResponseDto();
        response.setTotalUsers(userRepository.count());
        response.setTotalEquipment(equipmentRepository.count());
        response.setTotalBookings(bookingRepository.count());
        response.setTotalMaintenanceRecords(maintenanceRecordRepository.count());
        response.setTotalNotifications(notificationRepository.count());
        return response;
    }
}

package com.labresource.service.impl;

import com.labresource.dto.UtilizationLogRequestDto;
import com.labresource.dto.UtilizationLogResponseDto;
import com.labresource.entity.Booking;
import com.labresource.entity.Equipment;
import com.labresource.entity.User;
import com.labresource.entity.UtilizationLog;
import com.labresource.repository.BookingRepository;
import com.labresource.repository.EquipmentRepository;
import com.labresource.repository.UserRepository;
import com.labresource.repository.UtilizationLogRepository;
import com.labresource.service.UtilizationLogService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class UtilizationLogServiceImpl implements UtilizationLogService {

    private final UtilizationLogRepository utilizationLogRepository;
    private final EquipmentRepository equipmentRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    public UtilizationLogServiceImpl(
            UtilizationLogRepository utilizationLogRepository,
            EquipmentRepository equipmentRepository,
            BookingRepository bookingRepository,
            UserRepository userRepository
    ) {
        this.utilizationLogRepository = utilizationLogRepository;
        this.equipmentRepository = equipmentRepository;
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
    }

    @Override
    public UtilizationLogResponseDto createUtilizationLog(
            UtilizationLogRequestDto requestDto
    ) {

        Equipment equipment = equipmentRepository
                .findById(requestDto.getEquipmentId())
                .orElseThrow(() ->
                        new RuntimeException("Equipment not found"));

        User user = userRepository
                .findById(requestDto.getUserId())
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        /*
         * Prevent multiple active utilization logs
         * for the same equipment.
         */
        utilizationLogRepository
                .findFirstByEquipmentAndStatusIgnoreCaseOrderByStartTimeDesc(
                        equipment,
                        "IN_USE"
                )
                .ifPresent(log -> {
                    throw new RuntimeException(
                            "Equipment is already in use"
                    );
                });

        UtilizationLog utilizationLog = new UtilizationLog();

        utilizationLog.setEquipment(equipment);
        utilizationLog.setUser(user);

        /*
         * Booking is optional.
         * It is loaded only when bookingId is provided.
         */
        if (requestDto.getBookingId() != null
                && !requestDto.getBookingId().isBlank()) {

            Booking booking = bookingRepository
                    .findById(requestDto.getBookingId())
                    .orElseThrow(() ->
                            new RuntimeException("Booking not found"));

            utilizationLog.setBooking(booking);
        }

        LocalDateTime startTime = requestDto.getStartTime();

        if (startTime == null) {
            startTime = LocalDateTime.now();
        }

        utilizationLog.setStartTime(startTime);
        utilizationLog.setEndTime(requestDto.getEndTime());

        String source = requestDto.getUtilizationSource();

        if (source == null || source.isBlank()) {
            source = requestDto.getBookingId() != null
                    ? "BOOKING"
                    : "MANUAL";
        }

        utilizationLog.setUtilizationSource(source);
        utilizationLog.setRemarks(requestDto.getRemarks());

        /*
         * When endTime is already provided,
         * the log is treated as completed.
         */
        if (requestDto.getEndTime() != null) {

            validateTimeRange(
                    startTime,
                    requestDto.getEndTime()
            );

            int durationMinutes = Math.toIntExact(
                    Duration.between(
                            startTime,
                            requestDto.getEndTime()
                    ).toMinutes()
            );

            utilizationLog.setUsageDurationMinutes(durationMinutes);
            utilizationLog.setStatus("COMPLETED");

        } else {

            String status = requestDto.getStatus();

            if (status == null || status.isBlank()) {
                status = "IN_USE";
            }

            utilizationLog.setStatus(status);
        }

        UtilizationLog savedLog =
                utilizationLogRepository.save(utilizationLog);

        return mapToResponse(savedLog);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UtilizationLogResponseDto> getAllUtilizationLogs() {

        return utilizationLogRepository
                .findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public UtilizationLogResponseDto getUtilizationLogById(
            String id
    ) {

        UtilizationLog utilizationLog =
                getLogEntityById(id);

        return mapToResponse(utilizationLog);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UtilizationLogResponseDto> getLogsByEquipment(
            String equipmentId
    ) {

        Equipment equipment = equipmentRepository
                .findById(equipmentId)
                .orElseThrow(() ->
                        new RuntimeException("Equipment not found"));

        return utilizationLogRepository
                .findByEquipment(equipment)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<UtilizationLogResponseDto> getLogsByUser(
            String userId
    ) {

        User user = userRepository
                .findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return utilizationLogRepository
                .findByUser(user)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<UtilizationLogResponseDto> getLogsByBooking(
            String bookingId
    ) {

        Booking booking = bookingRepository
                .findById(bookingId)
                .orElseThrow(() ->
                        new RuntimeException("Booking not found"));

        return utilizationLogRepository
                .findByBooking(booking)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<UtilizationLogResponseDto> getLogsByStatus(
            String status
    ) {

        return utilizationLogRepository
                .findByStatusIgnoreCase(status)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<UtilizationLogResponseDto> getLogsByDateRange(
            LocalDateTime startTime,
            LocalDateTime endTime
    ) {

        validateTimeRange(startTime, endTime);

        return utilizationLogRepository
                .findByStartTimeBetween(startTime, endTime)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<UtilizationLogResponseDto>
    getEquipmentLogsByDateRange(
            String equipmentId,
            LocalDateTime startTime,
            LocalDateTime endTime
    ) {

        validateTimeRange(startTime, endTime);

        Equipment equipment = equipmentRepository
                .findById(equipmentId)
                .orElseThrow(() ->
                        new RuntimeException("Equipment not found"));

        return utilizationLogRepository
                .findByEquipmentAndStartTimeBetween(
                        equipment,
                        startTime,
                        endTime
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public UtilizationLogResponseDto getCurrentUtilization(
            String equipmentId
    ) {

        Equipment equipment = equipmentRepository
                .findById(equipmentId)
                .orElseThrow(() ->
                        new RuntimeException("Equipment not found"));

        UtilizationLog utilizationLog =
                utilizationLogRepository
                        .findFirstByEquipmentAndStatusIgnoreCaseOrderByStartTimeDesc(
                                equipment,
                                "IN_USE"
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Equipment is currently not in use"
                                ));

        return mapToResponse(utilizationLog);
    }

    @Override
    public UtilizationLogResponseDto stopUtilization(
            String utilizationLogId,
            String remarks
    ) {

        UtilizationLog utilizationLog =
                getLogEntityById(utilizationLogId);

        if (!"IN_USE".equalsIgnoreCase(
                utilizationLog.getStatus())) {

            throw new RuntimeException(
                    "Only an active utilization log can be stopped"
            );
        }

        LocalDateTime endTime = LocalDateTime.now();

        if (utilizationLog.getStartTime() == null) {
            throw new RuntimeException(
                    "Utilization start time is missing"
            );
        }

        long duration = Duration
                .between(
                        utilizationLog.getStartTime(),
                        endTime
                )
                .toMinutes();

        utilizationLog.setEndTime(endTime);
        utilizationLog.setUsageDurationMinutes(
                Math.toIntExact(duration)
        );
        utilizationLog.setStatus("COMPLETED");

        if (remarks != null && !remarks.isBlank()) {
            utilizationLog.setRemarks(remarks);
        }

        UtilizationLog updatedLog =
                utilizationLogRepository.save(utilizationLog);

        return mapToResponse(updatedLog);
    }

    @Override
    public UtilizationLogResponseDto updateUtilizationLog(
            String id,
            UtilizationLogRequestDto requestDto
    ) {

        UtilizationLog utilizationLog =
                getLogEntityById(id);

        if (requestDto.getEquipmentId() != null
                && !requestDto.getEquipmentId().isBlank()) {

            Equipment equipment = equipmentRepository
                    .findById(requestDto.getEquipmentId())
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Equipment not found"
                            ));

            utilizationLog.setEquipment(equipment);
        }

        if (requestDto.getUserId() != null
                && !requestDto.getUserId().isBlank()) {

            User user = userRepository
                    .findById(requestDto.getUserId())
                    .orElseThrow(() ->
                            new RuntimeException("User not found"));

            utilizationLog.setUser(user);
        }

        if (requestDto.getBookingId() != null
                && !requestDto.getBookingId().isBlank()) {

            Booking booking = bookingRepository
                    .findById(requestDto.getBookingId())
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Booking not found"
                            ));

            utilizationLog.setBooking(booking);
        }

        if (requestDto.getStartTime() != null) {
            utilizationLog.setStartTime(
                    requestDto.getStartTime()
            );
        }

        if (requestDto.getEndTime() != null) {
            utilizationLog.setEndTime(
                    requestDto.getEndTime()
            );
        }

        if (requestDto.getUtilizationSource() != null
                && !requestDto.getUtilizationSource().isBlank()) {

            utilizationLog.setUtilizationSource(
                    requestDto.getUtilizationSource()
            );
        }

        if (requestDto.getStatus() != null
                && !requestDto.getStatus().isBlank()) {

            utilizationLog.setStatus(
                    requestDto.getStatus()
            );
        }

        if (requestDto.getRemarks() != null) {
            utilizationLog.setRemarks(
                    requestDto.getRemarks()
            );
        }

        /*
         * Recalculate duration when both times are available.
         */
        if (utilizationLog.getStartTime() != null
                && utilizationLog.getEndTime() != null) {

            validateTimeRange(
                    utilizationLog.getStartTime(),
                    utilizationLog.getEndTime()
            );

            int durationMinutes = Math.toIntExact(
                    Duration.between(
                            utilizationLog.getStartTime(),
                            utilizationLog.getEndTime()
                    ).toMinutes()
            );

            utilizationLog.setUsageDurationMinutes(
                    durationMinutes
            );

            /*
             * If end time is provided and status was not sent,
             * automatically complete the utilization.
             */
            if (requestDto.getStatus() == null
                    || requestDto.getStatus().isBlank()) {

                utilizationLog.setStatus("COMPLETED");
            }
        }

        UtilizationLog updatedLog =
                utilizationLogRepository.save(utilizationLog);

        return mapToResponse(updatedLog);
    }

    @Override
    public void deleteUtilizationLog(String id) {

        UtilizationLog utilizationLog =
                getLogEntityById(id);

        utilizationLogRepository.delete(utilizationLog);
    }

    private UtilizationLog getLogEntityById(String id) {

        return utilizationLogRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Utilization log not found"
                        ));
    }

    private void validateTimeRange(
            LocalDateTime startTime,
            LocalDateTime endTime
    ) {

        if (startTime == null || endTime == null) {
            throw new RuntimeException(
                    "Start time and end time are required"
            );
        }

        if (!endTime.isAfter(startTime)) {
            throw new RuntimeException(
                    "End time must be after start time"
            );
        }
    }

    private UtilizationLogResponseDto mapToResponse(
            UtilizationLog utilizationLog
    ) {

        UtilizationLogResponseDto responseDto =
                new UtilizationLogResponseDto();

        responseDto.setId(utilizationLog.getId());

        if (utilizationLog.getEquipment() != null) {

            responseDto.setEquipmentId(
                    utilizationLog
                            .getEquipment()
                            .getId()
            );

            responseDto.setEquipmentName(
                    utilizationLog
                            .getEquipment()
                            .getName()
            );
        }

        if (utilizationLog.getBooking() != null) {

            responseDto.setBookingId(
                    utilizationLog
                            .getBooking()
                            .getId()
            );
        }

        if (utilizationLog.getUser() != null) {

            User user = utilizationLog.getUser();

            responseDto.setUserId(user.getId());

            String firstName = user.getFirstName() == null
                    ? ""
                    : user.getFirstName();

            String lastName = user.getLastName() == null
                    ? ""
                    : user.getLastName();

            responseDto.setUserName(
                    (firstName + " " + lastName).trim()
            );
        }

        responseDto.setStartTime(
                utilizationLog.getStartTime()
        );

        responseDto.setEndTime(
                utilizationLog.getEndTime()
        );

        responseDto.setUsageDurationMinutes(
                utilizationLog.getUsageDurationMinutes()
        );

        responseDto.setUtilizationSource(
                utilizationLog.getUtilizationSource()
        );

        responseDto.setStatus(
                utilizationLog.getStatus()
        );

        responseDto.setRemarks(
                utilizationLog.getRemarks()
        );

        responseDto.setCreatedAt(
                utilizationLog.getCreatedAt()
        );

        responseDto.setUpdatedAt(
                utilizationLog.getUpdatedAt()
        );

        return responseDto;
    }
}
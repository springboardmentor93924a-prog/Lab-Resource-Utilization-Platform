package com.labresource.controller;

import com.labresource.dto.UtilizationLogRequestDto;
import com.labresource.dto.UtilizationLogResponseDto;
import com.labresource.service.UtilizationLogService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/utilization-logs")
public class UtilizationLogController {

    private final UtilizationLogService utilizationLogService;

    public UtilizationLogController(
            UtilizationLogService utilizationLogService
    ) {
        this.utilizationLogService = utilizationLogService;
    }

    /*
     * Create/start utilization log
     */
    @PostMapping
    public ResponseEntity<UtilizationLogResponseDto> createUtilizationLog(
            @RequestBody UtilizationLogRequestDto requestDto
    ) {

        UtilizationLogResponseDto response =
                utilizationLogService.createUtilizationLog(requestDto);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    /*
     * Get all utilization logs
     */
    @GetMapping
    public ResponseEntity<List<UtilizationLogResponseDto>>
    getAllUtilizationLogs() {

        return ResponseEntity.ok(
                utilizationLogService.getAllUtilizationLogs()
        );
    }

    /*
     * Get utilization log by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<UtilizationLogResponseDto>
    getUtilizationLogById(
            @PathVariable String id
    ) {

        return ResponseEntity.ok(
                utilizationLogService.getUtilizationLogById(id)
        );
    }

    /*
     * Get utilization history by equipment
     */
    @GetMapping("/equipment/{equipmentId}")
    public ResponseEntity<List<UtilizationLogResponseDto>>
    getLogsByEquipment(
            @PathVariable String equipmentId
    ) {

        return ResponseEntity.ok(
                utilizationLogService.getLogsByEquipment(equipmentId)
        );
    }

    /*
     * Get utilization logs by user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UtilizationLogResponseDto>>
    getLogsByUser(
            @PathVariable String userId
    ) {

        return ResponseEntity.ok(
                utilizationLogService.getLogsByUser(userId)
        );
    }

    /*
     * Get utilization logs by booking
     */
    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<List<UtilizationLogResponseDto>>
    getLogsByBooking(
            @PathVariable String bookingId
    ) {

        return ResponseEntity.ok(
                utilizationLogService.getLogsByBooking(bookingId)
        );
    }

    /*
     * Get utilization logs by status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<UtilizationLogResponseDto>>
    getLogsByStatus(
            @PathVariable String status
    ) {

        return ResponseEntity.ok(
                utilizationLogService.getLogsByStatus(status)
        );
    }

    /*
     * Get all logs within date range
     *
     * Example:
     * /api/utilization-logs/date-range
     * ?startTime=2026-07-01T00:00:00
     * &endTime=2026-07-31T23:59:59
     */
    @GetMapping("/date-range")
    public ResponseEntity<List<UtilizationLogResponseDto>>
    getLogsByDateRange(
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime startTime,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime endTime
    ) {

        return ResponseEntity.ok(
                utilizationLogService.getLogsByDateRange(
                        startTime,
                        endTime
                )
        );
    }

    /*
     * Get equipment utilization logs within date range
     */
    @GetMapping("/equipment/{equipmentId}/date-range")
    public ResponseEntity<List<UtilizationLogResponseDto>>
    getEquipmentLogsByDateRange(
            @PathVariable String equipmentId,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime startTime,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime endTime
    ) {

        return ResponseEntity.ok(
                utilizationLogService.getEquipmentLogsByDateRange(
                        equipmentId,
                        startTime,
                        endTime
                )
        );
    }

    /*
     * Get current active utilization of equipment
     */
    @GetMapping("/equipment/{equipmentId}/current")
    public ResponseEntity<UtilizationLogResponseDto>
    getCurrentUtilization(
            @PathVariable String equipmentId
    ) {

        return ResponseEntity.ok(
                utilizationLogService.getCurrentUtilization(equipmentId)
        );
    }

    /*
     * Stop active utilization
     *
     * Example:
     * PUT /api/utilization-logs/{id}/stop
     * ?remarks=Work completed
     */
    @PutMapping("/{id}/stop")
    public ResponseEntity<UtilizationLogResponseDto>
    stopUtilization(
            @PathVariable String id,
            @RequestParam(required = false) String remarks
    ) {

        return ResponseEntity.ok(
                utilizationLogService.stopUtilization(
                        id,
                        remarks
                )
        );
    }

    /*
     * Update utilization log
     */
    @PutMapping("/{id}")
    public ResponseEntity<UtilizationLogResponseDto>
    updateUtilizationLog(
            @PathVariable String id,
            @RequestBody UtilizationLogRequestDto requestDto
    ) {

        return ResponseEntity.ok(
                utilizationLogService.updateUtilizationLog(
                        id,
                        requestDto
                )
        );
    }

    /*
     * Delete utilization log
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUtilizationLog(
            @PathVariable String id
    ) {

        utilizationLogService.deleteUtilizationLog(id);

        return ResponseEntity.noContent().build();
    }
}
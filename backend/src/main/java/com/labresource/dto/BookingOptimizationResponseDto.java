package com.labresource.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class BookingOptimizationResponseDto {

    private String requestedEquipmentId;

    private String requestedEquipmentName;

    private LocalDateTime requestedStartTime;

    private LocalDateTime requestedEndTime;

    private boolean requestedSlotAvailable;

    private String message;

    private List<AvailableSlotDto> suggestedSlots =
            new ArrayList<>();

    private List<AlternativeEquipmentDto> alternativeEquipment =
            new ArrayList<>();

    public String getRequestedEquipmentId() {
        return requestedEquipmentId;
    }

    public void setRequestedEquipmentId(
            String requestedEquipmentId
    ) {
        this.requestedEquipmentId = requestedEquipmentId;
    }

    public String getRequestedEquipmentName() {
        return requestedEquipmentName;
    }

    public void setRequestedEquipmentName(
            String requestedEquipmentName
    ) {
        this.requestedEquipmentName = requestedEquipmentName;
    }

    public LocalDateTime getRequestedStartTime() {
        return requestedStartTime;
    }

    public void setRequestedStartTime(
            LocalDateTime requestedStartTime
    ) {
        this.requestedStartTime = requestedStartTime;
    }

    public LocalDateTime getRequestedEndTime() {
        return requestedEndTime;
    }

    public void setRequestedEndTime(
            LocalDateTime requestedEndTime
    ) {
        this.requestedEndTime = requestedEndTime;
    }

    public boolean isRequestedSlotAvailable() {
        return requestedSlotAvailable;
    }

    public void setRequestedSlotAvailable(
            boolean requestedSlotAvailable
    ) {
        this.requestedSlotAvailable =
                requestedSlotAvailable;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public List<AvailableSlotDto> getSuggestedSlots() {
        return suggestedSlots;
    }

    public void setSuggestedSlots(
            List<AvailableSlotDto> suggestedSlots
    ) {
        this.suggestedSlots = suggestedSlots;
    }

    public List<AlternativeEquipmentDto>
    getAlternativeEquipment() {
        return alternativeEquipment;
    }

    public void setAlternativeEquipment(
            List<AlternativeEquipmentDto>
                    alternativeEquipment
    ) {
        this.alternativeEquipment =
                alternativeEquipment;
    }

    public static class AvailableSlotDto {

        private LocalDateTime startTime;

        private LocalDateTime endTime;

        private long gapMinutes;

        private String reason;

        public AvailableSlotDto() {
        }

        public AvailableSlotDto(
                LocalDateTime startTime,
                LocalDateTime endTime,
                long gapMinutes,
                String reason
        ) {
            this.startTime = startTime;
            this.endTime = endTime;
            this.gapMinutes = gapMinutes;
            this.reason = reason;
        }

        public LocalDateTime getStartTime() {
            return startTime;
        }

        public void setStartTime(
                LocalDateTime startTime
        ) {
            this.startTime = startTime;
        }

        public LocalDateTime getEndTime() {
            return endTime;
        }

        public void setEndTime(
                LocalDateTime endTime
        ) {
            this.endTime = endTime;
        }

        public long getGapMinutes() {
            return gapMinutes;
        }

        public void setGapMinutes(
                long gapMinutes
        ) {
            this.gapMinutes = gapMinutes;
        }

        public String getReason() {
            return reason;
        }

        public void setReason(String reason) {
            this.reason = reason;
        }
    }

    public static class AlternativeEquipmentDto {

        private String equipmentId;

        private String equipmentName;

        private String categoryId;

        private String categoryName;

        private String institutionId;

        private String institutionName;

        private String location;

        private String status;

        private double utilizationPercentage;

        private boolean availableForRequestedSlot;

        public AlternativeEquipmentDto() {
        }

        public String getEquipmentId() {
            return equipmentId;
        }

        public void setEquipmentId(
                String equipmentId
        ) {
            this.equipmentId = equipmentId;
        }

        public String getEquipmentName() {
            return equipmentName;
        }

        public void setEquipmentName(
                String equipmentName
        ) {
            this.equipmentName = equipmentName;
        }

        public String getCategoryId() {
            return categoryId;
        }

        public void setCategoryId(
                String categoryId
        ) {
            this.categoryId = categoryId;
        }

        public String getCategoryName() {
            return categoryName;
        }

        public void setCategoryName(
                String categoryName
        ) {
            this.categoryName = categoryName;
        }

        public String getInstitutionId() {
            return institutionId;
        }

        public void setInstitutionId(
                String institutionId
        ) {
            this.institutionId = institutionId;
        }

        public String getInstitutionName() {
            return institutionName;
        }

        public void setInstitutionName(
                String institutionName
        ) {
            this.institutionName = institutionName;
        }

        public String getLocation() {
            return location;
        }

        public void setLocation(
                String location
        ) {
            this.location = location;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(
                String status
        ) {
            this.status = status;
        }

        public double getUtilizationPercentage() {
            return utilizationPercentage;
        }

        public void setUtilizationPercentage(
                double utilizationPercentage
        ) {
            this.utilizationPercentage =
                    utilizationPercentage;
        }

        public boolean isAvailableForRequestedSlot() {
            return availableForRequestedSlot;
        }

        public void setAvailableForRequestedSlot(
                boolean availableForRequestedSlot
        ) {
            this.availableForRequestedSlot =
                    availableForRequestedSlot;
        }
    }
}
package com.labresource.repository;

import com.labresource.entity.Equipment;
import com.labresource.entity.ExternalBooking;
import com.labresource.entity.Institution;
import com.labresource.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ExternalBookingRepository
        extends JpaRepository<ExternalBooking, String> {


    List<ExternalBooking> findByEquipment(
            Equipment equipment
    );

    List<ExternalBooking> findByRequestedBy(
            User requestedBy
    );


    List<ExternalBooking> findByRequestingInstitution(
            Institution requestingInstitution
    );


    List<ExternalBooking> findByProviderInstitution(
            Institution providerInstitution
    );


    List<ExternalBooking> findByStatusIgnoreCase(
            String status
    );


    List<ExternalBooking>
    findByProviderInstitutionAndStatusIgnoreCase(
            Institution providerInstitution,
            String status
    );


    List<ExternalBooking>
    findByRequestedByAndStatusIgnoreCase(
            User requestedBy,
            String status
    );


    List<ExternalBooking>
    findByEquipmentAndStatusIgnoreCase(
            Equipment equipment,
            String status
    );


    List<ExternalBooking>
    findByRequestedStartTimeBetween(
            LocalDateTime startTime,
            LocalDateTime endTime
    );


    List<ExternalBooking>
    findByEquipmentAndRequestedStartTimeBetween(
            Equipment equipment,
            LocalDateTime startTime,
            LocalDateTime endTime
    );


    List<ExternalBooking>
    findByEquipmentAndStatusIgnoreCaseAndRequestedStartTimeLessThanAndRequestedEndTimeGreaterThan(
            Equipment equipment,
            String status,
            LocalDateTime requestedEndTime,
            LocalDateTime requestedStartTime
    );


    boolean
    existsByEquipmentAndStatusIgnoreCaseAndRequestedStartTimeLessThanAndRequestedEndTimeGreaterThan(
            Equipment equipment,
            String status,
            LocalDateTime requestedEndTime,
            LocalDateTime requestedStartTime
    );
}
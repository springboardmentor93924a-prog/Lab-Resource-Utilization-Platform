package com.infosys.labresource.booking.service;

import com.infosys.labresource.Equipment.Repository.EquipmentRepository;
import com.infosys.labresource.Equipment.entity.Equipment;
import com.infosys.labresource.Equipment.entity.EquipmentStatus;
import com.infosys.labresource.booking.Repository.BookingRepository;
import com.infosys.labresource.booking.dtos.BookingRequestDTO;
import com.infosys.labresource.booking.dtos.BookingResponseDTO;
import com.infosys.labresource.booking.entity.Booking;
import com.infosys.labresource.booking.entity.BookingStatus;
import com.infosys.labresource.user.Repository.InstitutionRepo;
import com.infosys.labresource.user.Repository.UserRepository;
import com.infosys.labresource.user.entites.Role;
import com.infosys.labresource.user.entites.UserEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService{
    private final BookingRepository bookingRepo;
    private final EquipmentRepository equipRepo;
    private final UserRepository userRepo;
    //private final InstitutionRepo institutionRepo;
    @Override
    public BookingResponseDTO createBooking(BookingRequestDTO requestDTO) {

        UserEntity user = userRepo.findById(requestDTO.getRequestedById())
                .orElseThrow(() -> new RuntimeException("User not found."));

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new RuntimeException("User is inactive.");
        }

        Equipment equip = equipRepo.findById(requestDTO.getEquipId())
                .orElseThrow(() -> new RuntimeException("Equipment not found."));

        if (requestDTO.getStartTime() == null ||
                requestDTO.getEndTime() == null) {
            throw new RuntimeException("Start time and end time are required.");
        }

        if (!requestDTO.getStartTime().isBefore(requestDTO.getEndTime())) {
            throw new RuntimeException("Start time must be before end time.");
        }

        if (requestDTO.getStartTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Booking cannot be created for past time.");
        }

        if (equip.getStatus() == EquipmentStatus.UNDER_MAINTENANCE ||
                equip.getStatus() == EquipmentStatus.OUT_OF_SERVICE ||
                equip.getStatus() == EquipmentStatus.RETIRED) {

            throw new RuntimeException(
                    "Equipment is not available for booking."
            );
        }

        boolean alreadyBooked =
                bookingRepo
                        .existsByEquipmentAndStartTimeLessThanAndEndTimeGreaterThan(
                                equip,
                                requestDTO.getEndTime(),
                                requestDTO.getStartTime()
                        );

        if (alreadyBooked) {
            throw new RuntimeException(
                    "Equipment already booked for selected time."
            );
        }

        /*
         * Internal / External booking is derived from
         * equipment institution and requesting user's institution.
         */
        boolean externalBooking =
                !equip.getInstitution().getInstitutionId()
                        .equals(user.getInstitution().getInstitutionId());

        Booking booking = new Booking();

        booking.setEquipment(equip);
        booking.setRequestedBy(user);

        // Requester's institution
        booking.setInstitution(user.getInstitution());

        booking.setStartTime(requestDTO.getStartTime());
        booking.setEndTime(requestDTO.getEndTime());

        /*
         * Both internal and external bookings initially
         * require approval.
         */
        booking.setStatus(BookingStatus.PENDING_APPROVAL);

        Booking savedBooking = bookingRepo.save(booking);

        return convertToDTO(savedBooking);
    }

    @Override
    public List<BookingResponseDTO> getAllBookings() {

        List<Booking> bookingList = bookingRepo.findAll();

        List<BookingResponseDTO> responseList = new ArrayList<>();

        for (Booking booking : bookingList) {
            responseList.add(convertToDTO(booking));
        }

        return responseList;
    }

    @Override
    public BookingResponseDTO getBookingById(Long bookingId) {
        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found."));

        return convertToDTO(booking);
    }

    @Override
    public BookingResponseDTO updateBooking(Long bookingId, BookingRequestDTO requestDTO) {
        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found."));

        Equipment equip = booking.getEquipment();

        if (requestDTO.getStartTime().isAfter(requestDTO.getEndTime())) {
            throw new RuntimeException("Invalid booking time.");
        }

        boolean alreadyBooked = bookingRepo
                .existsByEquipmentAndStartTimeLessThanAndEndTimeGreaterThan(
                        equip,
                        requestDTO.getEndTime(),
                        requestDTO.getStartTime());

        if (alreadyBooked &&
                !(booking.getStartTime().equals(requestDTO.getStartTime())
                        && booking.getEndTime().equals(requestDTO.getEndTime()))) {

            throw new RuntimeException("Selected slot is already booked.");
        }

        booking.setStartTime(requestDTO.getStartTime());
        booking.setEndTime(requestDTO.getEndTime());

        Booking updatedBooking = bookingRepo.save(booking);

        return convertToDTO(updatedBooking);
    }

    @Override
    public void cancelBooking(Long bookingId) {
        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found."));

        booking.setStatus(BookingStatus.CANCELLED);

        booking.getEquipment().setStatus(EquipmentStatus.AVAILABLE);

        equipRepo.save(booking.getEquipment());

        bookingRepo.save(booking);
    }

    @Override
    public BookingResponseDTO approveBooking(Long bookingId, String approverEmail) {

        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found."));

        if (booking.getStatus() != BookingStatus.PENDING_APPROVAL) {
            throw new RuntimeException(
                    "Only pending bookings can be approved."
            );
        }

        UserEntity approver = userRepo.findByEmail(approverEmail)
                .orElseThrow(() -> new RuntimeException("Approver not found."));

        Equipment equipment = booking.getEquipment();
        UserEntity requester = booking.getRequestedBy();

        Long equipmentInstitutionId =
                equipment.getInstitution().getInstitutionId();

        Long requesterInstitutionId =
                requester.getInstitution().getInstitutionId();

        Long equipmentDepartmentId =
                equipment.getDepartment().getDepartId();

        Long requesterDepartmentId =
                requester.getDepartment().getDepartId();

        /*
         * CASE 1:
         * Same institution + same department
         *
         * Approval required from:
         * LAB_MANAGER of equipment department
         */
        if (equipmentInstitutionId.equals(requesterInstitutionId)
                && equipmentDepartmentId.equals(requesterDepartmentId)) {

            if (approver.getRole() != Role.LAB_MANAGER) {
                throw new RuntimeException(
                        "Only the Lab Manager can approve this booking."
                );
            }

            if (!approver.getInstitution().getInstitutionId()
                    .equals(equipmentInstitutionId)) {

                throw new RuntimeException(
                        "Approver does not belong to the equipment institution."
                );
            }

            if (!approver.getDepartment().getDepartId()
                    .equals(equipmentDepartmentId)) {

                throw new RuntimeException(
                        "Approver does not belong to the equipment department."
                );
            }
        }

        /*
         * CASE 2:
         * Same institution + different departments
         *
         * Approval required from:
         * DEPARTMENT_HEAD
         */
        else if (equipmentInstitutionId.equals(requesterInstitutionId)) {

            if (approver.getRole() != Role.DEPARTMENT_HEAD) {
                throw new RuntimeException(
                        "Only the Department Head can approve this booking."
                );
            }

            if (!approver.getInstitution().getInstitutionId()
                    .equals(equipmentInstitutionId)) {

                throw new RuntimeException(
                        "Approver does not belong to the equipment institution."
                );
            }
        }

        /*
         * CASE 3:
         * Different institutions
         *
         * Approval required from:
         * INSTITUTION_ADMIN of equipment-owning institution
         */
        else {

            if (approver.getRole() != Role.INSTITUTION_ADMIN) {
                throw new RuntimeException(
                        "Only the Institution Admin can approve this booking."
                );
            }

            if (!approver.getInstitution().getInstitutionId()
                    .equals(equipmentInstitutionId)) {

                throw new RuntimeException(
                        "Only the Institution Admin of the equipment-owning institution can approve this booking."
                );
            }
        }

        /*
         * Approval successful
         */
        booking.setApprovedBy(approver);
        booking.setStatus(BookingStatus.CONFIRMED);

        equipment.setStatus(EquipmentStatus.BOOKED);

        equipRepo.save(equipment);

        Booking updatedBooking = bookingRepo.save(booking);

        return convertToDTO(updatedBooking);
    }

    @Override
    public BookingResponseDTO rejectBooking(Long bookingId) {
        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found."));

        booking.setStatus(BookingStatus.REJECTED);

        Booking updatedBooking = bookingRepo.save(booking);

        return convertToDTO(updatedBooking);

    }
    private BookingResponseDTO convertToDTO(Booking booking) {

        BookingResponseDTO dto = new BookingResponseDTO();

        dto.setBookingId(booking.getBookingId());
        dto.setEquipId(booking.getEquipment().getEquipId());
        dto.setRequestedById(booking.getRequestedBy().getUserId());

        if (booking.getApprovedBy() != null) {
            dto.setApprovedById(booking.getApprovedBy().getUserId());
        }

        dto.setStartTime(booking.getStartTime());
        dto.setEndTime(booking.getEndTime());
        dto.setStatus(booking.getStatus());

        return dto;
    }
}

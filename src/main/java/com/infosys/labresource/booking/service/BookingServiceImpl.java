package com.infosys.labresource.booking.service;

import com.infosys.labresource.Equipment.Repository.EquipmentRepository;
import com.infosys.labresource.Equipment.entity.Equipment;
import com.infosys.labresource.Equipment.entity.EquipmentStatus;
import com.infosys.labresource.booking.Repository.BookingRepository;
import com.infosys.labresource.booking.Repository.BookingWaitlistRepository;
import com.infosys.labresource.booking.dtos.BookingRequestDTO;
import com.infosys.labresource.booking.dtos.BookingResponseDTO;
import com.infosys.labresource.booking.entity.Booking;
import com.infosys.labresource.booking.entity.BookingStatus;
import com.infosys.labresource.booking.entity.BookingWaitlist;
import com.infosys.labresource.notification.entity.NotificationType;
import com.infosys.labresource.notification.service.NotificationService;
import com.infosys.labresource.user.Repository.UserRepository;
import com.infosys.labresource.user.entites.Role;
import com.infosys.labresource.user.entites.UserEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepo;
    private final EquipmentRepository equipRepo;
    private final UserRepository userRepo;
    private final BookingWaitlistRepository waitlistRepo;
private final NotificationService notifService;
    @Override
    @Transactional
    public BookingResponseDTO createBooking(BookingRequestDTO reqDto, String requesterEmail) {

        // requester is the currently logged in user, never taken from the request body
        UserEntity user = userRepo.findByEmail(requesterEmail)
                .orElseThrow(() -> new RuntimeException("User not found."));

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new RuntimeException("User is inactive.");
        }

        Equipment equip = equipRepo.findById(reqDto.getEquipId())
                .orElseThrow(() -> new RuntimeException("Equipment not found."));

        if (reqDto.getStartTime() == null || reqDto.getEndTime() == null) {
            throw new RuntimeException("Start time and end time are required.");
        }

        if (!reqDto.getStartTime().isBefore(reqDto.getEndTime())) {
            throw new RuntimeException("Start time must be before end time.");
        }

        if (reqDto.getStartTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Booking cannot be created for past time.");
        }

        // equipment which cannot be used at all should not be added to the waitlist
        if (equip.getStatus() == EquipmentStatus.UNDER_MAINTENANCE ||
                equip.getStatus() == EquipmentStatus.OUT_OF_SERVICE ||
                equip.getStatus() == EquipmentStatus.RETIRED) {

            throw new RuntimeException("Equipment is not available for booking.");
        }

        // check whether the requested time slot is already occupied by another booking
        boolean alreadyBooked = bookingRepo.existsByEquipmentAndStartTimeLessThanAndEndTimeGreaterThan(equip, reqDto.getEndTime(), reqDto.getStartTime());

        Booking booking = new Booking();

        booking.setEquipment(equip);
        booking.setRequestedBy(user);
        booking.setInstitution(user.getInstitution());
        booking.setStartTime(reqDto.getStartTime());
        booking.setEndTime(reqDto.getEndTime());

        // both internal and external bookings initially require approval
        booking.setStatus(BookingStatus.PENDING_APPROVAL);

        Booking savedBooking = bookingRepo.save(booking);

        // if the slot is already occupied, the booking goes into the waitlist instead of being rejected
        if (alreadyBooked) {

            BookingWaitlist waitlist = new BookingWaitlist();

            waitlist.setBooking(savedBooking);
            waitlist.setAddedAt(LocalDateTime.now());
            waitlist.setActive(true);

            waitlistRepo.save(waitlist);
        }

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
    public BookingResponseDTO updateBooking(Long bookingId, BookingRequestDTO reqDto) {

        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found."));

        Equipment equip = booking.getEquipment();

        if (reqDto.getStartTime() == null || reqDto.getEndTime() == null) {
            throw new RuntimeException("Start time and end time are required.");
        }

        if (!reqDto.getStartTime().isBefore(reqDto.getEndTime())) {
            throw new RuntimeException("Start time must be before end time.");
        }

        boolean alreadyBooked = bookingRepo.existsByEquipmentAndStartTimeLessThanAndEndTimeGreaterThan(equip, reqDto.getEndTime(), reqDto.getStartTime());

        if (alreadyBooked && !(booking.getStartTime().equals(reqDto.getStartTime()) && booking.getEndTime().equals(reqDto.getEndTime()))) {
            throw new RuntimeException("Selected slot is already booked.");
        }

        booking.setStartTime(reqDto.getStartTime());
        booking.setEndTime(reqDto.getEndTime());

        Booking updatedBooking = bookingRepo.save(booking);

        return convertToDTO(updatedBooking);
    }

    @Override
    @Transactional
    public void cancelBooking(Long bookingId) {

        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found."));

        booking.setStatus(BookingStatus.CANCELLED);

        Equipment equip = booking.getEquipment();
        equip.setStatus(EquipmentStatus.AVAILABLE);
        equipRepo.save(equip);

        // if this booking was on the waitlist, deactivate its entry
        waitlistRepo.findByBooking(booking)
                .ifPresent(waitlist -> {
                    waitlist.setActive(false);
                    waitlistRepo.save(waitlist);
                });

        bookingRepo.save(booking);

        // equipment just freed up, so the next person waiting for it should be picked up
        notifyNextInWaitlist(equip);
    }

    @Override
    @Transactional
    public BookingResponseDTO approveBooking(Long bookingId, String approverEmail) {

        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found."));

        if (booking.getStatus() != BookingStatus.PENDING_APPROVAL) {
            throw new RuntimeException("Only pending bookings can be approved.");
        }

        UserEntity approver = userRepo.findByEmail(approverEmail)
                .orElseThrow(() -> new RuntimeException("Approver not found."));

        Equipment equipment = booking.getEquipment();
        UserEntity requester = booking.getRequestedBy();

        Long equipmentInstitutionId = equipment.getInstitution().getInstitutionId();
        Long requesterInstitutionId = requester.getInstitution().getInstitutionId();
        Long equipmentDepartmentId = equipment.getDepartment().getDepartId();
        Long requesterDepartmentId = requester.getDepartment().getDepartId();

        // CASE 1: same institution + same department -> lab manager of that department approves
        if (equipmentInstitutionId.equals(requesterInstitutionId) && equipmentDepartmentId.equals(requesterDepartmentId)) {

            if (approver.getRole() != Role.LAB_MANAGER) {
                throw new RuntimeException("Only the Lab Manager can approve this booking.");
            }

            if (!approver.getInstitution().getInstitutionId().equals(equipmentInstitutionId)) {
                throw new RuntimeException("Approver does not belong to the equipment institution.");
            }

            if (!approver.getDepartment().getDepartId().equals(equipmentDepartmentId)) {
                throw new RuntimeException("Approver does not belong to the equipment department.");
            }
        }

        // CASE 2: same institution + different department -> department head approves
        else if (equipmentInstitutionId.equals(requesterInstitutionId)) {

            if (approver.getRole() != Role.DEPARTMENT_HEAD) {
                throw new RuntimeException("Only the Department Head can approve this booking.");
            }

            if (!approver.getInstitution().getInstitutionId().equals(equipmentInstitutionId)) {
                throw new RuntimeException("Approver does not belong to the equipment institution.");
            }
        }

        // CASE 3: different institutions -> institution admin of the equipment owning institution approves
        else {

            if (approver.getRole() != Role.INSTITUTION_ADMIN) {
                throw new RuntimeException("Only the Institution Admin can approve this booking.");
            }

            if (!approver.getInstitution().getInstitutionId().equals(equipmentInstitutionId)) {
                throw new RuntimeException("Only the Institution Admin of the equipment-owning institution can approve this booking.");
            }
        }

        booking.setApprovedBy(approver);
        booking.setStatus(BookingStatus.CONFIRMED);

        equipment.setStatus(EquipmentStatus.BOOKED);
        equipRepo.save(equipment);

        Booking updatedBooking = bookingRepo.save(booking);

        // once a waitlisted booking gets approved, its waitlist entry is no longer active
        waitlistRepo.findByBooking(booking)
                .ifPresent(waitlist -> {
                    waitlist.setActive(false);
                    waitlistRepo.save(waitlist);
                });
        String msg = "Your booking for " + equipment.getEquipName() + " has been approved.";
        notifService.send(requester, msg, NotificationType.BOOKING);
        return convertToDTO(updatedBooking);
    }

    @Override
    @Transactional
    public BookingResponseDTO rejectBooking(Long bookingId) {

        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found."));

        booking.setStatus(BookingStatus.REJECTED);

        waitlistRepo.findByBooking(booking)
                .ifPresent(waitlist -> {
                    waitlist.setActive(false);
                    waitlistRepo.save(waitlist);
                });

        Booking updatedBooking = bookingRepo.save(booking);

        String msg = "Your booking for " + booking.getEquipment().getEquipName() + " has been rejected.";
        notifService.send(booking.getRequestedBy(), msg, NotificationType.BOOKING);

        return convertToDTO(updatedBooking);
    }

    /*
     * Whenever equipment goes back to AVAILABLE (cancel / end of utilization),
     * the first active waitlist entry for that equipment should be picked up
     * so someone can act on it. This does NOT auto confirm the booking,
     * approval is a separate step, it just flags who is next in line.
     */
    private void notifyNextInWaitlist(Equipment equip) {

        List<BookingWaitlist> waiting = waitlistRepo.findByBooking_EquipmentAndActiveTrueOrderByAddedAtAsc(equip);

        if (waiting.isEmpty()) {
            return;
        }

        BookingWaitlist nextInLine = waiting.get(0);
        UserEntity nextUser = nextInLine.getBooking().getRequestedBy();

        // TODO: hook this up to the notification module once it is built (Milestone 3)
        System.out.println("Equipment " + equip.getEquipName() + " is now available. Next in waitlist: " + nextUser.getEmail());
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
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
    private final InstitutionRepo institutionRepo;
    @Override
    public BookingResponseDTO createBooking(BookingRequestDTO requestDTO) {

        UserEntity user = userRepo.findById(requestDTO.getRequestedById())
                .orElseThrow(() -> new RuntimeException("User not found."));

        if (!user.getIsActive()) {
            throw new RuntimeException("User is inactive.");
        }

        Equipment equip = equipRepo.findById(requestDTO.getEquipId())
                .orElseThrow(() -> new RuntimeException("Equipment not found."));

        if (equip.getStatus() != EquipmentStatus.AVAILABLE) {
            throw new RuntimeException("Equipment is not available.");
        }

        if (requestDTO.getStartTime().isAfter(requestDTO.getEndTime())) {
            throw new RuntimeException("Invalid booking time.");
        }

        if (requestDTO.getStartTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Booking cannot be created for past time.");
        }

        boolean alreadyBooked = bookingRepo
                .existsByEquipmentAndStartTimeLessThanAndEndTimeGreaterThan(
                        equip,
                        requestDTO.getEndTime(),
                        requestDTO.getStartTime());

        if (alreadyBooked) {
            throw new RuntimeException("Equipment already booked for selected time.");
        }

        Booking booking = new Booking();

        booking.setEquipment(equip);
        booking.setRequestedBy(user);
        booking.setInstitution(user.getInstitution());
        booking.setStartTime(requestDTO.getStartTime());
        booking.setEndTime(requestDTO.getEndTime());
        booking.setStatus(BookingStatus. PENDING_APPROVAL);

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
    public BookingResponseDTO approveBooking(Long bookingId) {
        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found."));

        booking.setStatus(BookingStatus.CONFIRMED);

        booking.getEquipment().setStatus(EquipmentStatus.BOOKED);

        equipRepo.save(booking.getEquipment());

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

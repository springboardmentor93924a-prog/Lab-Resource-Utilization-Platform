package com.example.lab_platform.service.impl;

import com.example.lab_platform.entity.Booking;
import com.example.lab_platform.entity.User;
import com.example.lab_platform.repository.BookingRepository;
import com.example.lab_platform.service.BookingService;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;

    public BookingServiceImpl(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }


    private User getLoggedInUser() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        return (User) authentication.getPrincipal();
    }


    private String getRole(User user) {

        return user.getRole().getRoleName();
    }



    @Override
    public Booking createBooking(Booking booking) {

        User loggedInUser = getLoggedInUser();

        String role = getRole(loggedInUser);


        if (role.equalsIgnoreCase("Student")
                || role.equalsIgnoreCase("Faculty")) {

            booking.setUser(loggedInUser);

        } else {

            throw new RuntimeException(
                    "Only Student and Faculty can create bookings");
        }


        booking.setBookingStatus("Pending");

        return bookingRepository.save(booking);
    }



    @Override
    public List<Booking> getAllBookings() {

        return bookingRepository.findAll();
    }



    @Override
    public Optional<Booking> getBookingById(Integer id) {

        return bookingRepository.findById(id);
    }



    @Override
    public Booking updateBooking(Integer id, Booking booking) {


        Booking existingBooking =
                bookingRepository.findById(id)
                .orElseThrow(() ->
                new RuntimeException("Booking not found"));



        User loggedInUser = getLoggedInUser();

        String role = getRole(loggedInUser);



        // Admin can update any booking
        if (!role.equalsIgnoreCase("Admin")) {


            if (!role.equalsIgnoreCase("Student")
                    && !role.equalsIgnoreCase("Faculty")) {

                throw new RuntimeException(
                        "You are not allowed to update bookings");
            }


            if (!existingBooking.getUser()
                    .getUserId()
                    .equals(loggedInUser.getUserId())) {

                throw new RuntimeException(
                        "You can update only your own booking");
            }


            if (!"Pending".equalsIgnoreCase(
                    existingBooking.getBookingStatus())) {

                throw new RuntimeException(
                        "Only Pending bookings can be updated");
            }
        }



        existingBooking.setEquipment(
                booking.getEquipment());

        existingBooking.setBookingDate(
                booking.getBookingDate());

        existingBooking.setStartTime(
                booking.getStartTime());

        existingBooking.setEndTime(
                booking.getEndTime());

        existingBooking.setPurpose(
                booking.getPurpose());



        // Only Admin can change status
        if (role.equalsIgnoreCase("Admin")
                && booking.getBookingStatus() != null) {

            existingBooking.setBookingStatus(
                    booking.getBookingStatus());
        }


        return bookingRepository.save(existingBooking);
    }




    @Override
    public void deleteBooking(Integer id) {


        Booking existingBooking =
                bookingRepository.findById(id)
                .orElseThrow(() ->
                new RuntimeException("Booking not found"));



        User loggedInUser = getLoggedInUser();

        String role = getRole(loggedInUser);



        // Admin can delete any booking
        if (role.equalsIgnoreCase("Admin")) {

            bookingRepository.delete(existingBooking);
            return;
        }



        // Student and Faculty can delete only their own
        if (!role.equalsIgnoreCase("Student")
                && !role.equalsIgnoreCase("Faculty")) {

            throw new RuntimeException(
                    "You are not allowed to delete bookings");
        }



        if (!existingBooking.getUser()
                .getUserId()
                .equals(loggedInUser.getUserId())) {

            throw new RuntimeException(
                    "You can delete only your own booking");
        }



        if (!"Pending".equalsIgnoreCase(
                existingBooking.getBookingStatus())) {

            throw new RuntimeException(
                    "Only Pending bookings can be deleted");
        }



        bookingRepository.delete(existingBooking);
    }





    @Override
    public Booking approveBooking(Integer id) {


        Booking booking =
                bookingRepository.findById(id)
                .orElseThrow(() ->
                new RuntimeException("Booking not found"));



        User loggedInUser = getLoggedInUser();

        String role = getRole(loggedInUser);



        if (!role.equalsIgnoreCase("Admin")
                && !role.equalsIgnoreCase("Lab_Technician")) {

            throw new RuntimeException(
                    "Only Admin and Lab Technician can approve");
        }



        if (!"Pending".equalsIgnoreCase(
                booking.getBookingStatus())) {

            throw new RuntimeException(
                    "Only Pending bookings can be approved");
        }



        booking.setBookingStatus("Confirmed");


        return bookingRepository.save(booking);
    }





    @Override
    public Booking rejectBooking(Integer id) {


        Booking booking =
                bookingRepository.findById(id)
                .orElseThrow(() ->
                new RuntimeException("Booking not found"));



        User loggedInUser = getLoggedInUser();

        String role = getRole(loggedInUser);



        if (!role.equalsIgnoreCase("Admin")
                && !role.equalsIgnoreCase("Lab_Technician")) {

            throw new RuntimeException(
                    "Only Admin and Lab Technician can reject");
        }



        if (!"Pending".equalsIgnoreCase(
                booking.getBookingStatus())) {

            throw new RuntimeException(
                    "Only Pending bookings can be rejected");
        }



        booking.setBookingStatus("Rejected");


        return bookingRepository.save(booking);
    }

}
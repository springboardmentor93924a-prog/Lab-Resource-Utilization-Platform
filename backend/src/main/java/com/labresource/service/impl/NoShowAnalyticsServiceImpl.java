package com.labresource.service.impl;

import com.labresource.dto.NoShowAnalyticsResponseDto;
import com.labresource.entity.Booking;
import com.labresource.repository.BookingRepository;
import com.labresource.service.NoShowAnalyticsService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class NoShowAnalyticsServiceImpl implements NoShowAnalyticsService {

    private final BookingRepository bookingRepository;

    public NoShowAnalyticsServiceImpl(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    @Override
    public NoShowAnalyticsResponseDto getNoShowAnalytics() {
        List<Booking> bookings = bookingRepository.findAll();

        long totalBookings = bookings.size();

        long noShowBookings = bookings.stream()
                .filter(b -> b.getBookingStatus() != null
                        && b.getBookingStatus().equalsIgnoreCase("NO_SHOW"))
                .count();

        double noShowRate = totalBookings == 0
                ? 0.0
                : ((double) noShowBookings / totalBookings) * 100.0;

        return new NoShowAnalyticsResponseDto(
                totalBookings,
                noShowBookings,
                noShowRate
        );
    }
}

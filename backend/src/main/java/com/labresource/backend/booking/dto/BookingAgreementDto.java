package com.labresource.backend.booking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingAgreementDto {
    private String version;
    private String title;
    private String summary;
    private List<String> terms;
    private boolean required;
}

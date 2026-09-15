package com.labresource.backend.invitation.controller;

import com.labresource.backend.auth.dto.UserSummaryDto;
import com.labresource.backend.invitation.dto.AcceptInvitationRequestDto;
import com.labresource.backend.invitation.dto.StaffInvitationRequestDto;
import com.labresource.backend.invitation.dto.StaffInvitationResponseDto;
import com.labresource.backend.invitation.service.StaffInvitationService;
import com.labresource.backend.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/staff/invitations")
@RequiredArgsConstructor
public class StaffInvitationController {

    private final StaffInvitationService invitationService;

    @PostMapping("/invite")
    @PreAuthorize("hasAuthority('MANAGE_USERS') or hasRole('INSTITUTION_ADMIN')")
    public StaffInvitationResponseDto inviteStaff(
            @AuthenticationPrincipal UserPrincipal admin,
            @Valid @RequestBody StaffInvitationRequestDto dto) {
        return invitationService.inviteStaff(admin, dto);
    }

    @GetMapping
    @PreAuthorize("hasAuthority('MANAGE_USERS') or hasRole('INSTITUTION_ADMIN')")
    public List<StaffInvitationResponseDto> getInvitations(@AuthenticationPrincipal UserPrincipal admin) {
        return invitationService.getInvitations(admin);
    }

    @PostMapping("/{invitationId}/cancel")
    @PreAuthorize("hasAuthority('MANAGE_USERS') or hasRole('INSTITUTION_ADMIN')")
    public void cancelInvitation(
            @AuthenticationPrincipal UserPrincipal admin,
            @PathVariable Long invitationId) {
        invitationService.cancelInvitation(admin, invitationId);
    }

    @GetMapping("/validate")
    public StaffInvitationResponseDto validateToken(@RequestParam("token") String rawToken) {
        return invitationService.validateToken(rawToken);
    }

    @PostMapping("/accept")
    public UserSummaryDto acceptInvitation(@Valid @RequestBody AcceptInvitationRequestDto dto) {
        return invitationService.acceptInvitation(dto);
    }
}

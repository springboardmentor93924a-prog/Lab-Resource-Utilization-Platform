package com.labresource.backend.audit.controller;

import com.labresource.backend.audit.entity.AuditLog;
import com.labresource.backend.audit.repository.AuditLogRepository;
import com.labresource.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogRepository auditLogRepository;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('INSTITUTION_ADMIN', 'ROLE_INSTITUTION_ADMIN', 'ROLE_SYSTEM_ADMIN', 'SYSTEM_ADMIN')")
    public List<AuditLog> getAuditLogs(@AuthenticationPrincipal UserPrincipal principal) {
        return auditLogRepository.findTop50ByOrderByTimestampDesc();
    }
}

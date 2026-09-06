package com.example.demo.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.entity.AccessRequest;
import com.example.demo.entity.Equipment;
import com.example.demo.entity.User;
import com.example.demo.repository.AccessRequestRepository;
import com.example.demo.repository.EquipmentRepository;
import com.example.demo.repository.UserRepository;

@RestController
@RequestMapping("/api/access-requests")
public class AccessRequestController {

    @Autowired private AccessRequestRepository accessRequestRepository;
    @Autowired private EquipmentRepository equipmentRepository;
    @Autowired private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body, java.security.Principal principal) {
        Object equipmentIdRaw = body.get("equipmentId");
        String reason = (String) body.get("reason");
        if (equipmentIdRaw == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "equipmentId is required"));
        }
        Integer equipmentId = Integer.valueOf(equipmentIdRaw.toString());

        User requestingUser = userRepository.findByEmail(principal.getName()).orElse(null);
        if (requestingUser == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Could not identify logged-in user"));
        }
        Equipment equipment = equipmentRepository.findById(equipmentId).orElse(null);
        if (equipment == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Equipment not found"));
        }

        AccessRequest ar = new AccessRequest();
        ar.setEquipment(equipment);
        ar.setRequestingUser(requestingUser);
        ar.setReason(reason);
        ar.setStatus("PENDING");
        ar.setCreatedAt(LocalDateTime.now());
        ar.setUpdatedAt(LocalDateTime.now());
        accessRequestRepository.save(ar);

        return ResponseEntity.ok(toResponse(ar));
    }

    @GetMapping("/my")
    public List<Map<String, Object>> myRequests(java.security.Principal principal) {
        User me = userRepository.findByEmail(principal.getName()).orElse(null);
        if (me == null) return List.of();
        return accessRequestRepository.findByRequestingUser_UserId(me.getUserId())
                .stream().map(this::toResponse).collect(java.util.stream.Collectors.toList());
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('LAB_MANAGER') or hasRole('DEPARTMENT_HEAD') or hasRole('INSTITUTION_ADMINISTRATOR') or hasRole('SYSTEM_ADMINISTRATOR')")
    public List<Map<String, Object>> pending() {
        return accessRequestRepository.findByStatus("PENDING")
                .stream().map(this::toPendingResponse).collect(java.util.stream.Collectors.toList());
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('LAB_MANAGER') or hasRole('DEPARTMENT_HEAD') or hasRole('INSTITUTION_ADMINISTRATOR') or hasRole('SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<?> approve(@PathVariable Integer id) {
        AccessRequest ar = accessRequestRepository.findById(id).orElse(null);
        if (ar == null) return ResponseEntity.status(404).body(Map.of("error", "Request not found"));
        ar.setStatus("APPROVED");
        ar.setUpdatedAt(LocalDateTime.now());
        accessRequestRepository.save(ar);
        return ResponseEntity.ok(toResponse(ar));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('LAB_MANAGER') or hasRole('DEPARTMENT_HEAD') or hasRole('INSTITUTION_ADMINISTRATOR') or hasRole('SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<?> reject(@PathVariable Integer id) {
        AccessRequest ar = accessRequestRepository.findById(id).orElse(null);
        if (ar == null) return ResponseEntity.status(404).body(Map.of("error", "Request not found"));
        ar.setStatus("REJECTED");
        ar.setUpdatedAt(LocalDateTime.now());
        accessRequestRepository.save(ar);
        return ResponseEntity.ok(toResponse(ar));
    }

    private Map<String, Object> toResponse(AccessRequest ar) {
        Map<String, Object> m = new java.util.HashMap<>();
        m.put("id", ar.getId());
        m.put("equipmentId", ar.getEquipment() != null ? ar.getEquipment().getEquipmentId() : null);
        m.put("equipmentName", ar.getEquipment() != null ? ar.getEquipment().getName() : null);
        m.put("owningInstitutionName", ar.getEquipment() != null && ar.getEquipment().getInstitution() != null
                ? ar.getEquipment().getInstitution().getInstitutionName() : null);
        m.put("status", ar.getStatus());
        m.put("reason", ar.getReason());
        return m;
    }

    private Map<String, Object> toPendingResponse(AccessRequest ar) {
        Map<String, Object> m = toResponse(ar);
        User u = ar.getRequestingUser();
        m.put("requestingUserName", u != null ? (u.getFirstName() + " " + u.getLastName()) : null);
        return m;
    }
}

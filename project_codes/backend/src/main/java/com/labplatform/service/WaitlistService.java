package com.labplatform.service;

import com.labplatform.entity.Equipment;
import com.labplatform.entity.User;
import com.labplatform.entity.Waitlist;
import com.labplatform.repository.EquipmentRepository;
import com.labplatform.repository.WaitlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WaitlistService {

    private final WaitlistRepository waitlistRepository;
    private final EquipmentRepository equipmentRepository;

    public Waitlist join(User user, Long equipmentId, LocalDateTime desiredStart, LocalDateTime desiredEnd) {
        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new IllegalArgumentException("Equipment not found"));

        Waitlist waitlist = Waitlist.builder()
                .equipment(equipment).user(user)
                .desiredStart(desiredStart).desiredEnd(desiredEnd)
                .build();
        return waitlistRepository.save(waitlist);
    }

    public List<Waitlist> forEquipment(Long equipmentId) {
        return waitlistRepository.findByEquipmentIdOrderByCreatedAtAsc(equipmentId);
    }

    public List<Waitlist> forUser(Long userId) {
        return waitlistRepository.findByUserId(userId);
    }

    public void leave(Long waitlistId) {
        waitlistRepository.deleteById(waitlistId);
    }
}

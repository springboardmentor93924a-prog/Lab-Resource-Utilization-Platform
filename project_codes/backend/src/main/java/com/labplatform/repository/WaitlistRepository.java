package com.labplatform.repository;

import com.labplatform.entity.Waitlist;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface WaitlistRepository extends JpaRepository<Waitlist, Long> {
    List<Waitlist> findByEquipmentIdOrderByCreatedAtAsc(Long equipmentId);
    List<Waitlist> findByUserId(Long userId);
}

package com.labplatform.sharing.repository;

import com.labplatform.sharing.model.EquipmentAccessGrant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EquipmentAccessGrantRepository extends JpaRepository<EquipmentAccessGrant, Integer> {

    Optional<EquipmentAccessGrant> findByUserIdAndEquipmentId(UUID userId, Long equipmentId);

    List<EquipmentAccessGrant> findByUserId(UUID userId);

    boolean existsByUserIdAndEquipmentIdAndRevokedFalse(UUID userId, Long equipmentId);
}
package com.labresource.backend.equipment.repository;

import com.labresource.backend.equipment.entity.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface EquipmentRepository extends JpaRepository<Equipment, Long> {

    @Query("SELECT e FROM Equipment e WHERE " +
           "(:search IS NULL OR CAST(:search AS string) = '' OR " +
           "  LOWER(e.name) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) OR " +
           "  LOWER(e.category) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) OR " +
           "  LOWER(e.manufacturer) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))) " +
           "AND (:category IS NULL OR CAST(:category AS string) = '' OR e.category = CAST(:category AS string)) " +
           "AND (:departmentId IS NULL OR e.departmentId = :departmentId) " +
           "AND (:institutionId IS NULL OR e.institutionId = :institutionId) " +
           "AND (:labId IS NULL OR e.labId = :labId) " +
           "AND (:location IS NULL OR CAST(:location AS string) = '' OR e.location = CAST(:location AS string)) " +
           "AND (:status IS NULL OR CAST(:status AS string) = '' OR e.status = CAST(:status AS string)) " +
           "AND (e.isActive = true) " +
           "AND (e.status <> 'RETIRED')")
    List<Equipment> search(@Param("search") String search,
                            @Param("category") String category,
                            @Param("departmentId") Long departmentId,
                            @Param("institutionId") Long institutionId,
                            @Param("labId") Long labId,
                            @Param("location") String location,
                            @Param("status") String status);

    @Query("SELECT DISTINCT e.category FROM Equipment e WHERE e.institutionId = :institutionId AND (:departmentId IS NULL OR e.departmentId = :departmentId) AND e.isActive = true AND e.status <> 'RETIRED' AND e.category IS NOT NULL AND e.category <> '' ORDER BY e.category")
    List<String> findDistinctCategoriesByInstitutionIdAndDept(@Param("institutionId") Long institutionId, @Param("departmentId") Long departmentId);

    @Query("SELECT DISTINCT e.category FROM Equipment e WHERE e.institutionId = :institutionId AND e.isActive = true AND e.status <> 'RETIRED' AND e.category IS NOT NULL AND e.category <> '' ORDER BY e.category")
    List<String> findDistinctCategoriesByInstitutionId(@Param("institutionId") Long institutionId);

    @Query("SELECT DISTINCT e.location FROM Equipment e WHERE e.institutionId = :institutionId AND e.isActive = true AND e.status <> 'RETIRED' AND (:departmentId IS NULL OR e.departmentId = :departmentId) AND (:labId IS NULL OR e.labId = :labId) AND e.location IS NOT NULL AND e.location <> '' ORDER BY e.location")
    List<String> findDistinctLocationsByInstitutionIdAndDeptAndLab(@Param("institutionId") Long institutionId, @Param("departmentId") Long departmentId, @Param("labId") Long labId);

    List<Equipment> findByDepartmentId(Long departmentId);
    List<Equipment> findByDepartmentIdAndInstitutionId(Long departmentId, Long institutionId);
    List<Equipment> findByLabId(Long labId);
    List<Equipment> findByInstitutionId(Long institutionId);
    long countByDepartmentIdAndStatus(Long departmentId, String status);
    long countByDepartmentIdAndInstitutionIdAndStatus(Long departmentId, Long institutionId, String status);
    long countByInstitutionIdAndStatus(Long institutionId, String status);

    @Query("SELECT e FROM Equipment e WHERE " +
           "e.institutionId = :partnerInstitutionId " +
           "AND e.isActive = true " +
           "AND e.status <> 'RETIRED' " +
           "AND (:departmentId IS NULL OR e.departmentId = :departmentId) " +
           "AND (:labId IS NULL OR e.labId = :labId) " +
           "AND (:category IS NULL OR CAST(:category AS string) = '' OR e.category = CAST(:category AS string)) " +
           "AND (:location IS NULL OR CAST(:location AS string) = '' OR e.location = CAST(:location AS string)) " +
           "AND (:search IS NULL OR CAST(:search AS string) = '' OR " +
           "  LOWER(e.name) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) OR " +
           "  LOWER(e.category) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) OR " +
           "  LOWER(e.manufacturer) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')))")
    List<Equipment> searchPartnerEquipment(
            @Param("partnerInstitutionId") Long partnerInstitutionId,
            @Param("departmentId") Long departmentId,
            @Param("labId") Long labId,
            @Param("category") String category,
            @Param("location") String location,
            @Param("search") String search);

    @Query("SELECT DISTINCT e.category FROM Equipment e WHERE e.institutionId = :institutionId AND e.isActive = true AND e.status <> 'RETIRED' AND (:departmentId IS NULL OR e.departmentId = :departmentId) AND e.category IS NOT NULL AND e.category <> '' ORDER BY e.category")
    List<String> findDistinctPartnerCategoriesByInstitutionIdAndDept(@Param("institutionId") Long institutionId, @Param("departmentId") Long departmentId);

    @Query("SELECT DISTINCT e.location FROM Equipment e WHERE e.institutionId = :institutionId AND e.isActive = true AND e.status <> 'RETIRED' AND (:departmentId IS NULL OR e.departmentId = :departmentId) AND (:labId IS NULL OR e.labId = :labId) AND e.location IS NOT NULL AND e.location <> '' ORDER BY e.location")
    List<String> findDistinctPartnerLocationsByInstitutionIdAndDeptAndLab(@Param("institutionId") Long institutionId, @Param("departmentId") Long departmentId, @Param("labId") Long labId);
}

package com.labresource.backend.heatmap;

import com.labresource.backend.auth.entity.AppUser;
import com.labresource.backend.booking.entity.Booking;
import com.labresource.backend.booking.repository.BookingRepository;
import com.labresource.backend.department.entity.Department;
import com.labresource.backend.department.repository.DepartmentRepository;
import com.labresource.backend.equipment.entity.Equipment;
import com.labresource.backend.equipment.repository.EquipmentOperatingScheduleRepository;
import com.labresource.backend.equipment.repository.EquipmentRepository;
import com.labresource.backend.heatmap.dto.HeatmapBookingDto;
import com.labresource.backend.heatmap.dto.HeatmapCellDto;
import com.labresource.backend.heatmap.dto.HeatmapDataDto;
import com.labresource.backend.heatmap.service.HeatmapService;
import com.labresource.backend.role.entity.Role;
import com.labresource.backend.security.UserPrincipal;
import com.labresource.backend.utilization.entity.UtilizationLog;
import com.labresource.backend.utilization.repository.UtilizationLogRepository;
import com.labresource.backend.auth.repository.AppUserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class HeatmapServiceTest {

    @Mock private EquipmentRepository equipmentRepository;
    @Mock private DepartmentRepository departmentRepository;
    @Mock private BookingRepository bookingRepository;
    @Mock private AppUserRepository appUserRepository;
    @Mock private UtilizationLogRepository utilizationLogRepository;
    @Mock private EquipmentOperatingScheduleRepository scheduleRepository;

    @InjectMocks
    private HeatmapService heatmapService;

    private Equipment eq1;
    private Equipment eq2;
    private Department dept1;
    private AppUser user1;

    @BeforeEach
    void setUp() {
        eq1 = new Equipment();
        eq1.setEquipmentId(101L);
        eq1.setName("Centrifuge A");
        eq1.setDepartmentId(10L);
        eq1.setInstitutionId(1L);
        eq1.setStatus(Equipment.AVAILABLE);
        eq1.setCategory("Centrifuges");

        eq2 = new Equipment();
        eq2.setEquipmentId(102L);
        eq2.setName("HPLC B");
        eq2.setDepartmentId(20L);
        eq2.setInstitutionId(1L);
        eq2.setStatus(Equipment.AVAILABLE);
        eq2.setCategory("Chromatography");

        dept1 = new Department();
        dept1.setDepartmentId(10L);
        dept1.setName("Biochemistry");

        user1 = new AppUser();
        user1.setUserId(50L);
        user1.setFirstName("Alice");
        user1.setLastName("Smith");

        lenient().when(departmentRepository.findAllById(any())).thenReturn(List.of(dept1));
        lenient().when(appUserRepository.findAllById(any())).thenReturn(List.of(user1));
        lenient().when(scheduleRepository.findByEquipmentId(any())).thenReturn(Collections.emptyList());
        lenient().when(utilizationLogRepository.findByBookingIdIn(any())).thenReturn(Collections.emptyList());
        lenient().when(bookingRepository.findByEquipmentIdIn(any())).thenReturn(Collections.emptyList());
        lenient().when(bookingRepository.findByEquipmentIdInAndOverlapping(any(), any(), any())).thenReturn(Collections.emptyList());
    }

    private UserPrincipal createPrincipal(String roleName, Long deptId, Long instId) {
        AppUser u = new AppUser();
        u.setUserId(1L);
        u.setEmail("user@example.com");
        u.setInstitutionId(instId);
        u.setDepartmentId(deptId);
        u.setIsActive(true);

        Role r = new Role();
        r.setRoleName(roleName);
        u.getRoles().add(r);

        return new UserPrincipal(u);
    }

    @Test
    @DisplayName("TEST 1: Completed booking + UtilizationLog -> actual utilization timestamps used and cell pre-calculated")
    void test1_CompletedBookingWithUtilizationLog() {
        UserPrincipal principal = createPrincipal(Role.SYSTEM_ADMIN, null, null);
        when(equipmentRepository.findAll()).thenReturn(List.of(eq1));

        Booking b = new Booking();
        b.setBookingId(1L);
        b.setEquipmentId(101L);
        b.setUserId(50L);
        b.setStatus(Booking.COMPLETED);
        b.setStartTime(LocalDateTime.of(2026, 8, 15, 9, 0));
        b.setEndTime(LocalDateTime.of(2026, 8, 15, 12, 0));

        when(bookingRepository.findByEquipmentIdInAndOverlapping(any(), any(), any())).thenReturn(List.of(b));

        UtilizationLog log = new UtilizationLog();
        log.setBookingId(1L);
        log.setEquipmentId(101L);
        log.setUsageStartTime(LocalDateTime.of(2026, 8, 15, 9, 30));
        log.setUsageEndTime(LocalDateTime.of(2026, 8, 15, 11, 0));

        when(utilizationLogRepository.findByBookingIdIn(List.of(1L))).thenReturn(List.of(log));

        LocalDateTime from = LocalDateTime.of(2026, 8, 15, 0, 0);
        LocalDateTime to = LocalDateTime.of(2026, 8, 15, 23, 59, 59);

        HeatmapDataDto data = heatmapService.getHeatmapData(principal, null, "day", "2026-08-15", null, null, null, from, to);

        assertEquals(1, data.getBookings().size());
        HeatmapBookingDto dto = data.getBookings().get(0);
        assertEquals("2026-08-15T09:30", dto.getStart());
        assertEquals("2026-08-15T11:00", dto.getEnd());

        assertNotNull(data.getCells());
        assertFalse(data.getCells().isEmpty());
        HeatmapCellDto cell9 = data.getCells().stream().filter(c -> c.getColKey().equals("2026-08-15-9")).findFirst().orElse(null);
        assertNotNull(cell9);
        assertEquals(50, cell9.getUtilizationPercentage());
    }

    @Test
    @DisplayName("TEST 2: Completed booking without UtilizationLog -> scheduled booking duration fallback")
    void test2_CompletedBookingWithoutUtilizationLog() {
        UserPrincipal principal = createPrincipal(Role.SYSTEM_ADMIN, null, null);
        when(equipmentRepository.findAll()).thenReturn(List.of(eq1));

        Booking b = new Booking();
        b.setBookingId(2L);
        b.setEquipmentId(101L);
        b.setUserId(50L);
        b.setStatus(Booking.COMPLETED);
        b.setStartTime(LocalDateTime.of(2026, 8, 15, 9, 0));
        b.setEndTime(LocalDateTime.of(2026, 8, 15, 12, 0));

        when(bookingRepository.findByEquipmentIdInAndOverlapping(any(), any(), any())).thenReturn(List.of(b));

        HeatmapDataDto data = heatmapService.getHeatmapData(principal, null, null, null);

        assertEquals(1, data.getBookings().size());
        HeatmapBookingDto dto = data.getBookings().get(0);
        assertEquals("2026-08-15T09:00", dto.getStart());
        assertEquals("2026-08-15T12:00", dto.getEnd());
    }

    @Test
    @DisplayName("TEST 3: Future CONFIRMED booking -> included in booking DTOs")
    void test3_FutureConfirmedBooking() {
        UserPrincipal principal = createPrincipal(Role.SYSTEM_ADMIN, null, null);
        when(equipmentRepository.findAll()).thenReturn(List.of(eq1));

        Booking b = new Booking();
        b.setBookingId(3L);
        b.setEquipmentId(101L);
        b.setUserId(50L);
        b.setStatus(Booking.CONFIRMED);
        b.setStartTime(LocalDateTime.now().plusDays(5));
        b.setEndTime(LocalDateTime.now().plusDays(5).plusHours(2));

        when(bookingRepository.findByEquipmentIdInAndOverlapping(any(), any(), any())).thenReturn(List.of(b));

        HeatmapDataDto data = heatmapService.getHeatmapData(principal, null, null, null);

        assertEquals(1, data.getBookings().size());
        assertEquals(Booking.CONFIRMED, data.getBookings().get(0).getStatus());
    }

    @Test
    @DisplayName("TEST 4: IN_USE booking -> included in usable bookings")
    void test4_InUseBooking() {
        UserPrincipal principal = createPrincipal(Role.SYSTEM_ADMIN, null, null);
        when(equipmentRepository.findAll()).thenReturn(List.of(eq1));

        Booking b = new Booking();
        b.setBookingId(4L);
        b.setEquipmentId(101L);
        b.setUserId(50L);
        b.setStatus(Booking.IN_USE);
        b.setStartTime(LocalDateTime.now().minusHours(1));
        b.setEndTime(LocalDateTime.now().plusHours(1));

        when(bookingRepository.findByEquipmentIdInAndOverlapping(any(), any(), any())).thenReturn(List.of(b));

        HeatmapDataDto data = heatmapService.getHeatmapData(principal, null, null, null);

        assertEquals(1, data.getBookings().size());
        assertEquals(Booking.IN_USE, data.getBookings().get(0).getStatus());
    }

    @Test
    @DisplayName("TEST 5: REJECTED booking -> excluded from result")
    void test5_RejectedBookingExcluded() {
        UserPrincipal principal = createPrincipal(Role.SYSTEM_ADMIN, null, null);
        when(equipmentRepository.findAll()).thenReturn(List.of(eq1));

        Booking b = new Booking();
        b.setBookingId(5L);
        b.setEquipmentId(101L);
        b.setUserId(50L);
        b.setStatus(Booking.REJECTED);
        b.setStartTime(LocalDateTime.of(2026, 8, 15, 9, 0));
        b.setEndTime(LocalDateTime.of(2026, 8, 15, 12, 0));

        when(bookingRepository.findByEquipmentIdInAndOverlapping(any(), any(), any())).thenReturn(List.of(b));

        HeatmapDataDto data = heatmapService.getHeatmapData(principal, null, null, null);

        assertTrue(data.getBookings().isEmpty());
    }

    @Test
    @DisplayName("TEST 6: CANCELLED booking -> excluded from result")
    void test6_CancelledBookingExcluded() {
        UserPrincipal principal = createPrincipal(Role.SYSTEM_ADMIN, null, null);
        when(equipmentRepository.findAll()).thenReturn(List.of(eq1));

        Booking b = new Booking();
        b.setBookingId(6L);
        b.setEquipmentId(101L);
        b.setUserId(50L);
        b.setStatus(Booking.CANCELLED);
        b.setStartTime(LocalDateTime.of(2026, 8, 15, 9, 0));
        b.setEndTime(LocalDateTime.of(2026, 8, 15, 12, 0));

        when(bookingRepository.findByEquipmentIdInAndOverlapping(any(), any(), any())).thenReturn(List.of(b));

        HeatmapDataDto data = heatmapService.getHeatmapData(principal, null, null, null);

        assertTrue(data.getBookings().isEmpty());
    }

    @Test
    @DisplayName("TEST 7: Multiple bookings -> all usable returned")
    void test7_MultipleBookingsAggregation() {
        UserPrincipal principal = createPrincipal(Role.SYSTEM_ADMIN, null, null);
        when(equipmentRepository.findAll()).thenReturn(List.of(eq1));

        Booking b1 = new Booking();
        b1.setBookingId(10L);
        b1.setEquipmentId(101L);
        b1.setUserId(50L);
        b1.setStatus(Booking.CONFIRMED);
        b1.setStartTime(LocalDateTime.of(2026, 8, 15, 9, 0));
        b1.setEndTime(LocalDateTime.of(2026, 8, 15, 10, 0));

        Booking b2 = new Booking();
        b2.setBookingId(11L);
        b2.setEquipmentId(101L);
        b2.setUserId(50L);
        b2.setStatus(Booking.COMPLETED);
        b2.setStartTime(LocalDateTime.of(2026, 8, 15, 11, 0));
        b2.setEndTime(LocalDateTime.of(2026, 8, 15, 13, 0));

        when(bookingRepository.findByEquipmentIdInAndOverlapping(any(), any(), any())).thenReturn(List.of(b1, b2));

        HeatmapDataDto data = heatmapService.getHeatmapData(principal, null, null, null);

        assertEquals(2, data.getBookings().size());
    }

    @Test
    @DisplayName("TEST 8: Overlapping bookings -> fetched via findByEquipmentIdInAndOverlapping when range provided")
    void test8_OverlappingBookingsWithDateRange() {
        UserPrincipal principal = createPrincipal(Role.SYSTEM_ADMIN, null, null);
        when(equipmentRepository.findAll()).thenReturn(List.of(eq1));

        LocalDateTime from = LocalDateTime.of(2026, 8, 15, 0, 0);
        LocalDateTime to = LocalDateTime.of(2026, 8, 15, 23, 59, 59);

        Booking b = new Booking();
        b.setBookingId(8L);
        b.setEquipmentId(101L);
        b.setUserId(50L);
        b.setStatus(Booking.CONFIRMED);
        b.setStartTime(LocalDateTime.of(2026, 8, 14, 22, 0));
        b.setEndTime(LocalDateTime.of(2026, 8, 15, 4, 0));

        when(bookingRepository.findByEquipmentIdInAndOverlapping(List.of(101L), from, to)).thenReturn(List.of(b));

        HeatmapDataDto data = heatmapService.getHeatmapData(principal, null, from, to);

        assertEquals(1, data.getBookings().size());
        assertEquals(8L, data.getBookings().get(0).getId());
    }

    @Test
    @DisplayName("TEST 9: DAY range -> queried correctly and cells generated")
    void test9_DayRange() {
        UserPrincipal principal = createPrincipal(Role.SYSTEM_ADMIN, null, null);
        when(equipmentRepository.findAll()).thenReturn(List.of(eq1));

        LocalDateTime from = LocalDateTime.of(2026, 8, 15, 0, 0);
        LocalDateTime to = LocalDateTime.of(2026, 8, 15, 23, 59, 59);

        when(bookingRepository.findByEquipmentIdInAndOverlapping(List.of(101L), from, to)).thenReturn(Collections.emptyList());

        HeatmapDataDto data = heatmapService.getHeatmapData(principal, null, "day", "2026-08-15", null, null, null, from, to);

        verify(bookingRepository).findByEquipmentIdInAndOverlapping(List.of(101L), from, to);
        assertNotNull(data);
        assertEquals(10, data.getCells().size());
    }

    @Test
    @DisplayName("TEST 10: WEEK range -> queried correctly")
    void test10_WeekRange() {
        UserPrincipal principal = createPrincipal(Role.SYSTEM_ADMIN, null, null);
        when(equipmentRepository.findAll()).thenReturn(List.of(eq1));

        LocalDateTime from = LocalDateTime.of(2026, 8, 10, 0, 0);
        LocalDateTime to = LocalDateTime.of(2026, 8, 16, 23, 59, 59);

        HeatmapDataDto data = heatmapService.getHeatmapData(principal, null, "week", null, "2026-W33", null, null, from, to);

        assertNotNull(data);
        assertEquals(7, data.getCells().size());
    }

    @Test
    @DisplayName("TEST 11: MONTH range -> queried correctly")
    void test11_MonthRange() {
        UserPrincipal principal = createPrincipal(Role.SYSTEM_ADMIN, null, null);
        when(equipmentRepository.findAll()).thenReturn(List.of(eq1));

        LocalDateTime from = LocalDateTime.of(2026, 8, 1, 0, 0);
        LocalDateTime to = LocalDateTime.of(2026, 8, 31, 23, 59, 59);

        HeatmapDataDto data = heatmapService.getHeatmapData(principal, null, "month", null, null, "2026-08", null, from, to);

        assertNotNull(data);
        assertEquals(31, data.getCells().size());
    }

    @Test
    @DisplayName("TEST 12: YEAR range -> queried correctly")
    void test12_YearRange() {
        UserPrincipal principal = createPrincipal(Role.SYSTEM_ADMIN, null, null);
        when(equipmentRepository.findAll()).thenReturn(List.of(eq1));

        LocalDateTime from = LocalDateTime.of(2026, 1, 1, 0, 0);
        LocalDateTime to = LocalDateTime.of(2026, 12, 31, 23, 59, 59);

        HeatmapDataDto data = heatmapService.getHeatmapData(principal, null, "year", null, null, null, 2026, from, to);

        assertNotNull(data);
        assertEquals(12, data.getCells().size());
    }

    @Test
    @DisplayName("TEST 13: Multiple equipment -> distinct equipment entries and pre-calculated cells returned")
    void test13_MultipleEquipmentIsolation() {
        UserPrincipal principal = createPrincipal(Role.SYSTEM_ADMIN, null, null);
        when(equipmentRepository.findAll()).thenReturn(List.of(eq1, eq2));

        HeatmapDataDto data = heatmapService.getHeatmapData(principal, null, null, null);

        assertEquals(2, data.getEquipment().size());
        assertNotNull(data.getSummary());
    }

    @Test
    @DisplayName("TEST 14: Department Head -> own department only")
    void test14_DepartmentHeadOwnDeptOnly() {
        UserPrincipal principal = createPrincipal(Role.DEPARTMENT_HEAD, 10L, 1L);
        when(equipmentRepository.findByDepartmentIdAndInstitutionId(10L, 1L)).thenReturn(List.of(eq1));

        HeatmapDataDto data = heatmapService.getHeatmapData(principal, null, null, null);

        assertEquals(1, data.getEquipment().size());
        assertEquals("Centrifuge A", data.getEquipment().get(0).getName());
    }

    @Test
    @DisplayName("TEST 15: Department Head foreign department parameter -> ignored, returns own dept only")
    void test15_DepartmentHeadForeignDeptParameterIgnored() {
        UserPrincipal principal = createPrincipal(Role.DEPARTMENT_HEAD, 10L, 1L);
        when(equipmentRepository.findByDepartmentIdAndInstitutionId(10L, 1L)).thenReturn(List.of(eq1));

        HeatmapDataDto data = heatmapService.getHeatmapData(principal, 20L, null, null);

        assertEquals(1, data.getEquipment().size());
        assertEquals(101L, data.getEquipment().get(0).getId());
    }

    @Test
    @DisplayName("TEST 16: Department Head foreign institution parameter -> ignored, returns own dept only")
    void test16_DepartmentHeadForeignInstitutionIgnored() {
        UserPrincipal principal = createPrincipal(Role.DEPARTMENT_HEAD, 10L, 1L);
        when(equipmentRepository.findByDepartmentIdAndInstitutionId(10L, 1L)).thenReturn(List.of(eq1));

        HeatmapDataDto data = heatmapService.getHeatmapData(principal, 999L, null, null);

        assertEquals(1, data.getEquipment().size());
    }

    @Test
    @DisplayName("TEST 17: Lab Manager -> own department only")
    void test17_LabManagerOwnDept() {
        UserPrincipal principal = createPrincipal(Role.LAB_MANAGER, 10L, 1L);
        when(equipmentRepository.findByDepartmentIdAndInstitutionId(10L, 1L)).thenReturn(List.of(eq1));

        HeatmapDataDto data = heatmapService.getHeatmapData(principal, null, null, null);

        assertEquals(1, data.getEquipment().size());
    }

    @Test
    @DisplayName("TEST 18: Lab Technician -> own department only")
    void test18_LabTechnicianOwnDept() {
        UserPrincipal principal = createPrincipal(Role.LAB_TECHNICIAN, 10L, 1L);
        when(equipmentRepository.findByDepartmentIdAndInstitutionId(10L, 1L)).thenReturn(List.of(eq1));

        HeatmapDataDto data = heatmapService.getHeatmapData(principal, null, null, null);

        assertEquals(1, data.getEquipment().size());
    }

    @Test
    @DisplayName("TEST 19: Institution Admin -> own institution equipment")
    void test19_InstitutionAdminOwnInstitution() {
        UserPrincipal principal = createPrincipal(Role.INSTITUTION_ADMIN, null, 1L);
        when(equipmentRepository.findByInstitutionId(1L)).thenReturn(List.of(eq1, eq2));

        HeatmapDataDto data = heatmapService.getHeatmapData(principal, null, null, null);

        assertEquals(2, data.getEquipment().size());
    }

    @Test
    @DisplayName("TEST 20: System Admin -> global scope")
    void test20_SystemAdminGlobalScope() {
        UserPrincipal principal = createPrincipal(Role.SYSTEM_ADMIN, null, null);
        when(equipmentRepository.findAll()).thenReturn(List.of(eq1, eq2));

        HeatmapDataDto data = heatmapService.getHeatmapData(principal, null, null, null);

        assertEquals(2, data.getEquipment().size());
    }

    @Test
    @DisplayName("TEST 21: Null department for department-scoped user -> empty result")
    void test21_NullDeptForDeptUserReturnsEmpty() {
        UserPrincipal principal = createPrincipal(Role.DEPARTMENT_HEAD, null, 1L);

        HeatmapDataDto data = heatmapService.getHeatmapData(principal, null, null, null);

        assertTrue(data.getEquipment().isEmpty());
        assertTrue(data.getBookings().isEmpty());
    }

    @Test
    @DisplayName("TEST 22: Repeated request -> deterministic result")
    void test22_RepeatedRequestDeterministic() {
        UserPrincipal principal = createPrincipal(Role.SYSTEM_ADMIN, null, null);
        when(equipmentRepository.findAll()).thenReturn(List.of(eq1));

        HeatmapDataDto data1 = heatmapService.getHeatmapData(principal, null, null, null);
        HeatmapDataDto data2 = heatmapService.getHeatmapData(principal, null, null, null);

        assertEquals(data1.getEquipment().size(), data2.getEquipment().size());
        assertEquals(data1.getSummary().getAverageUtilization(), data2.getSummary().getAverageUtilization());
    }

    @Test
    @DisplayName("TEST 23: Empty database -> empty result returned without error")
    void test23_EmptyDatabaseReturnsEmptyDataDto() {
        UserPrincipal principal = createPrincipal(Role.SYSTEM_ADMIN, null, null);
        when(equipmentRepository.findAll()).thenReturn(Collections.emptyList());

        HeatmapDataDto data = heatmapService.getHeatmapData(principal, null, null, null);

        assertNotNull(data);
        assertTrue(data.getEquipment().isEmpty());
        assertTrue(data.getBookings().isEmpty());
        assertTrue(data.getCells().isEmpty());
    }
}

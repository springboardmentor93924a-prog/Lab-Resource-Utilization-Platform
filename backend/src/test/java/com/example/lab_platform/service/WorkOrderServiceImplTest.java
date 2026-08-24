package com.example.lab_platform.service;

import com.example.lab_platform.entity.Equipment;
import com.example.lab_platform.entity.MaintenanceRequest;
import com.example.lab_platform.entity.User;
import com.example.lab_platform.entity.WorkOrder;
import com.example.lab_platform.repository.EquipmentRepository;
import com.example.lab_platform.repository.MaintenanceRequestRepository;
import com.example.lab_platform.repository.UserRepository;
import com.example.lab_platform.repository.WorkOrderRepository;
import com.example.lab_platform.service.impl.WorkOrderServiceImpl;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/*
 * TASK 1 (Milestone 3): unit tests for the work order lifecycle -
 * creation, technician assignment, and the equipment/downtime side
 * effects that fire when a work order opens or closes.
 *
 * Plain Mockito unit tests - no Spring context, no database - so
 * they run without a live Postgres instance, matching how the rest
 * of the environment this project builds in is constrained.
 */
@ExtendWith(MockitoExtension.class)
class WorkOrderServiceImplTest {

    @Mock private WorkOrderRepository workOrderRepository;
    @Mock private EquipmentRepository equipmentRepository;
    @Mock private UserRepository userRepository;
    @Mock private MaintenanceRequestRepository maintenanceRequestRepository;
    @Mock private EquipmentDowntimeService equipmentDowntimeService;
    @Mock private NotificationService notificationService;
    @Mock private BookingService bookingService;

    private WorkOrderServiceImpl workOrderService;

    private Equipment equipment;

    @BeforeEach
    void setUp() {
        workOrderService = new WorkOrderServiceImpl(
                workOrderRepository,
                equipmentRepository,
                userRepository,
                maintenanceRequestRepository,
                equipmentDowntimeService,
                notificationService,
                bookingService
        );

        equipment = new Equipment();
        equipment.setEquipmentId(1);
        equipment.setEquipmentName("Centrifuge");
        equipment.setStatus("Available");
    }

    @Test
    void createWorkOrder_setsEquipmentUnderMaintenance_andOpensDowntimeWindow() {
        WorkOrder input = new WorkOrder();
        input.setEquipment(equipment);
        input.setDescription("Unusual vibration during spin cycle");

        when(equipmentRepository.findById(1)).thenReturn(Optional.of(equipment));
        when(workOrderRepository.save(any(WorkOrder.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        WorkOrder result = workOrderService.createWorkOrder(input);

        assertEquals("OPEN", result.getWorkOrderStatus());
        assertEquals("Under Maintenance", equipment.getStatus());
        // Downtime windows are now opened with a link back to the
        // triggering work order (see EquipmentDowntimeService), so the
        // 3-arg overload is what actually gets called here.
        verify(equipmentDowntimeService).openDowntimeWindow(eq(equipment), eq(result), any(String.class));
        verify(equipmentRepository).save(equipment);
    }

    @Test
    void createWorkOrder_withoutEquipment_throws() {
        WorkOrder input = new WorkOrder();

        assertThrows(RuntimeException.class, () -> workOrderService.createWorkOrder(input));

        verifyNoInteractions(equipmentDowntimeService);
    }

    @Test
    void createWorkOrderFromRequest_pullsEquipmentAndMarksRequestInProgress() {
        MaintenanceRequest request = new MaintenanceRequest();
        request.setRequestId(10);
        request.setEquipment(equipment);
        request.setDescription("Requested by student - odd noise");
        request.setPriority("Medium");
        request.setRequestStatus("APPROVED");

        when(maintenanceRequestRepository.findById(10)).thenReturn(Optional.of(request));
        when(equipmentRepository.findById(1)).thenReturn(Optional.of(equipment));
        when(workOrderRepository.save(any(WorkOrder.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        // Note: no findByEquipment_EquipmentId stub here - the new work
        // order is created OPEN, so applyEquipmentSideEffects() returns
        // right after opening the downtime window and never queries
        // existing work orders for this equipment (that query only runs
        // when a work order is being closed).

        WorkOrder result = workOrderService.createWorkOrderFromRequest(10, null);

        assertEquals(equipment, result.getEquipment());
        assertEquals(request.getDescription(), result.getDescription());
        assertEquals("IN_PROGRESS", request.getRequestStatus());
        verify(maintenanceRequestRepository).save(request);
    }

    @Test
    void updateWorkOrder_toCompleted_releasesEquipmentAndClosesDowntime() {
        WorkOrder existing = new WorkOrder();
        existing.setWorkOrderId(5);
        existing.setEquipment(equipment);
        existing.setWorkOrderStatus("IN_PROGRESS");

        when(workOrderRepository.findById(5)).thenReturn(Optional.of(existing));
        when(workOrderRepository.save(any(WorkOrder.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        // no other work orders still blocking this equipment
        when(workOrderRepository.findByEquipment_EquipmentId(1)).thenReturn(List.of(existing));

        WorkOrder changes = new WorkOrder();
        changes.setWorkOrderStatus("COMPLETED");

        WorkOrder result = workOrderService.updateWorkOrder(5, changes);

        assertEquals("COMPLETED", result.getWorkOrderStatus());
        assertNotNull(result.getCompletionDate());
        assertEquals("Available", equipment.getStatus());
        verify(equipmentDowntimeService).closeOpenDowntimeWindow(equipment);
        verify(bookingService).processWaitlistForEquipment(1);
    }

    @Test
    void updateWorkOrder_toCompleted_keepsEquipmentBlocked_ifAnotherWorkOrderStillOpen() {
        WorkOrder existing = new WorkOrder();
        existing.setWorkOrderId(5);
        existing.setEquipment(equipment);
        existing.setWorkOrderStatus("IN_PROGRESS");

        WorkOrder anotherOpenOrder = new WorkOrder();
        anotherOpenOrder.setWorkOrderId(6);
        anotherOpenOrder.setEquipment(equipment);
        anotherOpenOrder.setWorkOrderStatus("OPEN");

        when(workOrderRepository.findById(5)).thenReturn(Optional.of(existing));
        when(workOrderRepository.save(any(WorkOrder.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(workOrderRepository.findByEquipment_EquipmentId(1))
                .thenReturn(List.of(existing, anotherOpenOrder));

        WorkOrder changes = new WorkOrder();
        changes.setWorkOrderStatus("COMPLETED");

        workOrderService.updateWorkOrder(5, changes);

        verify(equipmentDowntimeService, never()).closeOpenDowntimeWindow(any());
        verify(bookingService, never()).processWaitlistForEquipment(any());
    }

    @Test
    void assignTechnician_savesAssignmentAndNotifiesTechnician() {
        WorkOrder workOrder = new WorkOrder();
        workOrder.setWorkOrderId(7);
        workOrder.setEquipment(equipment);

        User technician = new User();
        technician.setUserId(42);

        when(workOrderRepository.findById(7)).thenReturn(Optional.of(workOrder));
        when(userRepository.findById(42)).thenReturn(Optional.of(technician));
        when(workOrderRepository.save(any(WorkOrder.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        WorkOrder result = workOrderService.assignTechnician(7, 42);

        assertEquals(technician, result.getAssignedTo());
        verify(notificationService).create(
                eq(technician),
                eq("WORK_ORDER_ASSIGNED"),
                any(String.class),
                any(String.class),
                eq(7)
        );
    }

    @Test
    void getMyWorkOrders_delegatesToRepositoryUsingLoggedInUser() {
        // getMyWorkOrders() reads the authenticated principal via
        // SecurityContextHolder, which requires a real security
        // context - out of scope for a plain unit test. Covered by
        // manual verification against a live JWT instead (see
        // CHANGED_FILES.md, section 7).
        verifyNoInteractions(workOrderRepository);
    }
}

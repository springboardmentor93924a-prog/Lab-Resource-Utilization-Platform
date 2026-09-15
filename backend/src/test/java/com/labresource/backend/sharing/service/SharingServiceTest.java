package com.labresource.backend.sharing.service;

import com.labresource.backend.auth.entity.AppUser;
import com.labresource.backend.common.exception.ApiException;
import com.labresource.backend.equipment.entity.Equipment;
import com.labresource.backend.equipment.repository.EquipmentRepository;
import com.labresource.backend.institution.entity.Institution;
import com.labresource.backend.institution.repository.InstitutionRepository;
import com.labresource.backend.laboratory.entity.Laboratory;
import com.labresource.backend.laboratory.repository.LaboratoryRepository;
import com.labresource.backend.notification.service.NotificationService;
import com.labresource.backend.security.UserPrincipal;
import com.labresource.backend.sharing.dto.InstitutionSharingOverviewDto;
import com.labresource.backend.sharing.dto.SharingMoUProposalDto;
import com.labresource.backend.sharing.entity.ResourceSharingRequest;
import com.labresource.backend.sharing.entity.SharingAgreement;
import com.labresource.backend.sharing.repository.ResourceSharingRequestRepository;
import com.labresource.backend.sharing.repository.SharedBookingRepository;
import com.labresource.backend.sharing.repository.SharingAgreementRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class SharingServiceTest {

    @Mock
    private ResourceSharingRequestRepository requestRepository;

    @Mock
    private SharingAgreementRepository agreementRepository;

    @Mock
    private SharedBookingRepository sharedBookingRepository;

    @Mock
    private EquipmentRepository equipmentRepository;

    @Mock
    private LaboratoryRepository laboratoryRepository;

    @Mock
    private InstitutionRepository institutionRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private com.labresource.backend.billing.repository.CostRecordRepository costRecordRepository;

    @InjectMocks
    private SharingService sharingService;

    private UserPrincipal requestingDeptHead;
    private UserPrincipal owningDeptHead;
    private UserPrincipal instAdmin;

    @BeforeEach
    void setUp() {
        AppUser reqUser = new AppUser();
        reqUser.setUserId(2L);
        reqUser.setInstitutionId(1L);
        reqUser.setDepartmentId(101L);
        requestingDeptHead = new UserPrincipal(reqUser);

        AppUser ownUser = new AppUser();
        ownUser.setUserId(5L);
        ownUser.setInstitutionId(100L);
        ownUser.setDepartmentId(202L);
        owningDeptHead = new UserPrincipal(ownUser);

        AppUser adminUser = new AppUser();
        adminUser.setUserId(10L);
        adminUser.setInstitutionId(1L);
        instAdmin = new UserPrincipal(adminUser);
    }

    @Test
    public void submitRequest_Success() {
        Long equipmentId = 3L;
        LocalDate start = LocalDate.now().plusDays(1);
        LocalDate end = LocalDate.now().plusDays(5);
        String purpose = "Research Collaboration";

        Equipment eq = new Equipment();
        eq.setEquipmentId(equipmentId);
        eq.setInstitutionId(100L); // owned by institution 100
        eq.setDepartmentId(202L);
        eq.setIsShareable(true);

        when(equipmentRepository.findById(equipmentId)).thenReturn(Optional.of(eq));

        ResourceSharingRequest saved = new ResourceSharingRequest();
        saved.setRequestId(10L);
        saved.setRequestingInstitutionId(1L);
        saved.setRequestingDepartmentId(101L);
        saved.setOwningInstitutionId(100L);
        saved.setOwningDepartmentId(202L);
        saved.setEquipmentId(equipmentId);
        saved.setRequestedBy(2L);
        saved.setRequestedStartDate(start);
        saved.setRequestedEndDate(end);
        saved.setPurpose(purpose);
        saved.setStatus("PENDING");

        when(requestRepository.save(any(ResourceSharingRequest.class))).thenReturn(saved);

        ResourceSharingRequest result = sharingService.submitRequest(requestingDeptHead, equipmentId, start, end, purpose);

        assertNotNull(result);
        assertEquals("PENDING", result.getStatus());
        assertEquals(100L, result.getOwningInstitutionId());
        verify(requestRepository, times(1)).save(any(ResourceSharingRequest.class));
    }

    @Test
    public void submitRequest_SameInstitutionError() {
        Long equipmentId = 3L;
        LocalDate start = LocalDate.now().plusDays(1);
        LocalDate end = LocalDate.now().plusDays(5);
        String purpose = "Research Collaboration";

        Equipment eq = new Equipment();
        eq.setEquipmentId(equipmentId);
        eq.setInstitutionId(1L); // owned by institution 1 (same!)
        eq.setIsShareable(true);

        when(equipmentRepository.findById(equipmentId)).thenReturn(Optional.of(eq));

        ApiException exception = assertThrows(ApiException.class, () -> {
            sharingService.submitRequest(requestingDeptHead, equipmentId, start, end, purpose);
        });

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
        assertTrue(exception.getMessage().contains("Cannot request inter-institution sharing"));
    }

    @Test
    public void proposeMou_Success() {
        Long requestId = 10L;
        BigDecimal proposedRate = BigDecimal.valueOf(1500);
        String mouTerms = "Standard MOU terms";

        ResourceSharingRequest request = new ResourceSharingRequest();
        request.setRequestId(requestId);
        request.setOwningInstitutionId(100L);
        request.setStatus("PENDING");
        request.setRequestedBy(2L);

        when(requestRepository.findById(requestId)).thenReturn(Optional.of(request));
        when(requestRepository.save(any(ResourceSharingRequest.class))).thenAnswer(i -> i.getArgument(0));

        SharingMoUProposalDto dto = new SharingMoUProposalDto(proposedRate, mouTerms, LocalDate.now(), LocalDate.now().plusDays(10), LocalTime.of(9, 0), LocalTime.of(17, 0));
        ResourceSharingRequest result = sharingService.proposeMou(owningDeptHead, requestId, dto);

        assertEquals("MOU_PROPOSED", result.getStatus());
        assertEquals(proposedRate, result.getProposedHourlyRate());
        assertEquals(mouTerms, result.getMouTerms());
    }

    @Test
    public void rejectRequest_WithReason_Success() {
        Long requestId = 10L;
        String reason = "Equipment required for internal research";

        ResourceSharingRequest request = new ResourceSharingRequest();
        request.setRequestId(requestId);
        request.setOwningInstitutionId(100L);
        request.setStatus("PENDING");
        request.setRequestedBy(2L);

        when(requestRepository.findById(requestId)).thenReturn(Optional.of(request));
        when(requestRepository.save(any(ResourceSharingRequest.class))).thenAnswer(i -> i.getArgument(0));

        ResourceSharingRequest result = sharingService.rejectRequest(owningDeptHead, requestId, reason);

        assertEquals("REJECTED", result.getStatus());
        assertEquals(reason, result.getRejectionReason());
    }

    @Test
    public void acceptMou_Success() {
        Long requestId = 10L;

        ResourceSharingRequest request = new ResourceSharingRequest();
        request.setRequestId(requestId);
        request.setStatus("MOU_PROPOSED");
        request.setRequestingInstitutionId(1L);
        request.setOwningInstitutionId(100L);
        request.setEquipmentId(3L);
        request.setProposedHourlyRate(BigDecimal.valueOf(2000));
        request.setMouTerms("Agreed terms");
        request.setRequestedStartDate(LocalDate.now());
        request.setRequestedEndDate(LocalDate.now().plusDays(10));
        request.setReviewedBy(5L);

        when(requestRepository.findById(requestId)).thenReturn(Optional.of(request));
        when(agreementRepository.save(any(SharingAgreement.class))).thenAnswer(i -> i.getArgument(0));

        SharingAgreement agreement = sharingService.acceptMou(requestingDeptHead, requestId);

        assertNotNull(agreement);
        assertEquals("ACTIVE", agreement.getStatus());
        assertEquals(BigDecimal.valueOf(2000), agreement.getHourlyRate());
        assertEquals(2L, agreement.getTermsAcceptedBy());
    }

    @Test
    public void catalogSharedEquipment_Success() {
        Long agreementId = 50L;
        Long targetLabId = 10L;

        SharingAgreement agreement = new SharingAgreement();
        agreement.setAgreementId(agreementId);
        agreement.setRequestingInstitutionId(1L);
        agreement.setOwningInstitutionId(100L);
        agreement.setEquipmentId(3L);
        agreement.setHourlyRate(BigDecimal.valueOf(1200));
        agreement.setMouTerms("MoU terms verified");

        Laboratory lab = new Laboratory();
        lab.setLabId(targetLabId);
        lab.setDepartmentId(101L);

        Equipment sourceEq = new Equipment();
        sourceEq.setEquipmentId(3L);
        sourceEq.setName("High Spec Oscilloscope");
        sourceEq.setCategory("Testing");
        sourceEq.setSerialNumber("OSC-999");
        sourceEq.setCondition("Excellent");

        when(agreementRepository.findById(agreementId)).thenReturn(Optional.of(agreement));
        when(laboratoryRepository.findById(targetLabId)).thenReturn(Optional.of(lab));
        when(equipmentRepository.findById(3L)).thenReturn(Optional.of(sourceEq));
        when(equipmentRepository.save(any(Equipment.class))).thenAnswer(i -> i.getArgument(0));

        Equipment cataloged = sharingService.catalogSharedEquipment(requestingDeptHead, agreementId, targetLabId);

        assertNotNull(cataloged);
        assertTrue(cataloged.getName().contains("High Spec Oscilloscope"));
        assertEquals(BigDecimal.valueOf(1200), cataloged.getHourlyRate());
        assertTrue(cataloged.getSpecifications().contains("MoU"));
    }

    @Test
    public void getInstitutionSharingOverview_Success() {
        Institution inst = new Institution();
        inst.setInstitutionId(1L);
        inst.setName("Karpagam College of Engineering");

        when(institutionRepository.findById(1L)).thenReturn(Optional.of(inst));
        when(requestRepository.findByOwningInstitutionIdOrderByCreatedAtDesc(1L)).thenReturn(Collections.emptyList());
        when(requestRepository.findByRequestingInstitutionIdOrderByCreatedAtDesc(1L)).thenReturn(Collections.emptyList());
        when(costRecordRepository.findAll()).thenReturn(Collections.emptyList());

        InstitutionSharingOverviewDto overview = sharingService.getInstitutionSharingOverview(instAdmin);

        assertNotNull(overview);
        assertEquals("Karpagam College of Engineering", overview.getInstitutionName());
        assertEquals(0, overview.getTotalActiveMoUs());
        assertEquals(BigDecimal.ZERO, overview.getTotalRevenueEarned());
    }
}

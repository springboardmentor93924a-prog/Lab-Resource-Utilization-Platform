package com.labresource.controller;

import com.labresource.dto.institution.InstitutionRequest;
import com.labresource.dto.institution.InstitutionResponse;
import com.labresource.service.InstitutionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/institutions")
@RequiredArgsConstructor
public class InstitutionController {

    private final InstitutionService institutionService;

    @PostMapping
    public ResponseEntity<InstitutionResponse> createInstitution(
            @Valid @RequestBody InstitutionRequest request
    ) {
        InstitutionResponse response =
                institutionService.createInstitution(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    public ResponseEntity<List<InstitutionResponse>> getAllInstitutions() {
        return ResponseEntity.ok(
                institutionService.getAllInstitutions()
        );
    }

    @GetMapping("/{institutionId}")
    public ResponseEntity<InstitutionResponse> getInstitutionById(
            @PathVariable String institutionId
    ) {
        return ResponseEntity.ok(
                institutionService.getInstitutionById(institutionId)
        );
    }

    @PutMapping("/{institutionId}")
    public ResponseEntity<InstitutionResponse> updateInstitution(
            @PathVariable String institutionId,
            @Valid @RequestBody InstitutionRequest request
    ) {
        return ResponseEntity.ok(
                institutionService.updateInstitution(
                        institutionId,
                        request
                )
        );
    }

    @DeleteMapping("/{institutionId}")
    public ResponseEntity<Void> deleteInstitution(
            @PathVariable String institutionId
    ) {
        institutionService.deleteInstitution(institutionId);

        return ResponseEntity.noContent().build();
    }
}
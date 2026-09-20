package com.labresource.backend.controller;

import com.labresource.backend.entity.Institution;
import com.labresource.backend.service.InstitutionService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/institutions")
@CrossOrigin(origins = "*")
public class InstitutionController {

    private final InstitutionService institutionService;

    public InstitutionController(InstitutionService institutionService) {
        this.institutionService = institutionService;
    }

    @PostMapping
    public Institution createInstitution(@RequestBody Institution institution) {
        return institutionService.saveInstitution(institution);
    }

    @GetMapping
    public List<Institution> getAllInstitutions() {
        return institutionService.getAllInstitutions();
    }

    @GetMapping("/{id}")
    public Institution getInstitutionById(@PathVariable Integer id) {
        return institutionService.getInstitutionById(id);
    }

    @PutMapping("/{id}")
    public Institution updateInstitution(
            @PathVariable Integer id,
            @RequestBody Institution institution) {

        return institutionService.updateInstitution(id, institution);
    }

    @DeleteMapping("/{id}")
    public String deleteInstitution(@PathVariable Integer id) {
        institutionService.deleteInstitution(id);
        return "Institution Deleted Successfully";
    }
}
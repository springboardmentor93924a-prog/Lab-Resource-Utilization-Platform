package com.infosys.labresource.user.Controller;

import com.infosys.labresource.user.Service.InstitutionService;
import com.infosys.labresource.user.entites.Institution;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/institutions")
@RequiredArgsConstructor
public class InstitutionController {
    private final InstitutionService institutionService;

    @PostMapping
    public Institution createInstitution(@RequestBody Institution institution,
                                         Authentication authentication) {
        return institutionService.createInstitution(institution, authentication);
    }

    @GetMapping
    public List<Institution> getAllInstitutions() {
        return institutionService.getAllInstitutions();
    }

    @GetMapping("/code/{code}")
    public Institution getInstitutionByCode(@PathVariable String code) {
        return institutionService.getInstitutionByCode(code);
    }

    @GetMapping("/name/{name}")
    public Institution getInstitutionByName(@PathVariable String name) {
        return institutionService.getInstitutionByName(name);
    }

    @GetMapping("/city/{city}")
    public List<Institution> getInstitutionsByCity(@PathVariable String city) {
        return institutionService.getInstitutionsByCity(city);
    }

    @PutMapping("/{id}")
    public Institution updateInstitution(@PathVariable Long id,
                                         @RequestBody Institution institution,
                                         Authentication authentication) {

        return institutionService.updateInstitution(id, institution, authentication);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteInstitution(@PathVariable Long id,
                                                    Authentication authentication) {

        institutionService.deleteInstitution(id, authentication);

        return ResponseEntity.ok("Institution deleted successfully.");
    }
}

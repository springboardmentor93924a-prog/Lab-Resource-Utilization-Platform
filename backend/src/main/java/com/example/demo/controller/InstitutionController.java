package com.example.demo.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.demo.entity.Institution;
import com.example.demo.repository.InstitutionRepository;

@RestController
@RequestMapping("/api/institutions")
public class InstitutionController {
    @Autowired
    private InstitutionRepository institutionRepository;

    @GetMapping
    public List<Institution> getAll() {
        return institutionRepository.findAll();
    }
}

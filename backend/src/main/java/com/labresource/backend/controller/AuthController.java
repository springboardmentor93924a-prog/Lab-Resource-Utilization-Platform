package com.labresource.backend.controller;

import com.labresource.backend.dto.RegisterRequest;
import com.labresource.backend.service.AuthenticationService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthenticationService authenticationService;

    public AuthController(AuthenticationService authenticationService) {
        this.authenticationService = authenticationService;
    }

    @PostMapping("/register")
    public String register(@RequestBody RegisterRequest request) {
        return authenticationService.register(request);
    }
}
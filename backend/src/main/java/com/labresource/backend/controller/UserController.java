package com.labresource.backend.controller;

import com.labresource.backend.dto.LoginRequest;
import com.labresource.backend.entity.User;
import com.labresource.backend.service.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService service;

    public UserController(UserService service) {
        this.service = service;
    }

    @PostMapping
    public User save(@RequestBody User user) {
        return service.save(user);
    }

    @GetMapping
    public List<User> getAll() {
        return service.getAll();
    }
    @PostMapping("/login")
public User login(@RequestBody LoginRequest request) {

    return service.login(
            request.getEmail(),
            request.getPassword()
    );
}
}

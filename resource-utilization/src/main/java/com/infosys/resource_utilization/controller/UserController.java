package com.infosys.resource_utilization.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infosys.resource_utilization.entity.User;
import com.infosys.resource_utilization.service.UserService;

import jakarta.validation.Valid;
@CrossOrigin(origins = "http://localhost:5173")

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    // Constructor Injection
    public UserController(UserService userService) {
        this.userService = userService;
    }

    // GET All Users
    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    // GET User By ID
    @GetMapping("/{id}")
    public User getUser(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    // CREATE User
    @PostMapping
    public User addUser(@Valid @RequestBody User user) {
        return userService.saveUser(user);
    }

    // UPDATE User
    @PutMapping("/{id}")
    public User updateUser(@PathVariable Long id,
                        @Valid @RequestBody User user) {
        return userService.updateUser(id, user);
    }

    // DELETE User
    @DeleteMapping("/{id}")
    public String deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return "User deleted successfully";
    }
}
package com.infosys.labresource.user.Controller;

import com.infosys.labresource.user.DTOs.LoginRequestDTO;
import com.infosys.labresource.user.DTOs.RegisterRequestDTO;
import com.infosys.labresource.user.DTOs.UpdateUserDTO;
import com.infosys.labresource.user.Service.UserService;
import com.infosys.labresource.user.entites.Department;
import com.infosys.labresource.user.entites.Institution;
import com.infosys.labresource.user.entites.UserEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;


    @PostMapping("/register")
    public UserEntity registerUser(@RequestBody RegisterRequestDTO req) {
        return userService.registerUser(req);
    }

    @GetMapping
    public List<UserEntity> getAllUsers(Authentication auth) {
        return userService.getAllUsers(auth);
    }

    @GetMapping("/{email}")
    public UserEntity getUserByEmail(@PathVariable String email,
                                     Authentication authentication) {

        return userService.getUserByEmail(email, authentication);
    }
    @PutMapping("/{email}")
    public UserEntity updateUser(@PathVariable String email,
                                 @RequestBody UpdateUserDTO request) {

        return userService.updateUser(email, request);
    }
    @DeleteMapping("/{email}")
    public ResponseEntity<String> deleteUser(@PathVariable String email,
                                             Authentication authentication) {

        userService.deleteUser(email, authentication);

        return ResponseEntity.ok("User deleted successfully.");
    }

    @GetMapping("/pending")
    public List<UserEntity> getPendingUsers(Authentication auth) {

        return userService.getPendingUsers(auth);
    }

    @PutMapping("/approve/{email}")
    public UserEntity approveUser(@PathVariable String email,
                                  Authentication auth) {

        return userService.approveUser(email, auth);
    }
   /* @PostMapping("/login")
    public UserEntity loginUser(@RequestBody LoginRequestDTO req) {
        return userService.loginUser(req);
    }*/
}

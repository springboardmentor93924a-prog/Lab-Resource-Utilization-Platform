package com.infosys.labresource.user.Controller;

import com.infosys.labresource.user.DTOs.LoginRequestDTO;
import com.infosys.labresource.user.DTOs.RegisterRequestDTO;
import com.infosys.labresource.user.Service.UserService;
import com.infosys.labresource.user.entites.Department;
import com.infosys.labresource.user.entites.Institution;
import com.infosys.labresource.user.entites.UserEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @PostMapping("/institution")
    public Institution createInstitution(@RequestBody Institution institution) {
        return userService.createInstitution(institution);
    }

    @PostMapping("/department")
    public Department createDepartment(@RequestBody Department department) {
        return userService.createDepartment(department);
    }

    @PostMapping("/register")
    public UserEntity registerUser(@RequestBody RegisterRequestDTO req) {
        return userService.registerUser(req);
    }

   /* @PostMapping("/login")
    public UserEntity loginUser(@RequestBody LoginRequestDTO req) {
        return userService.loginUser(req);
    }*/
}

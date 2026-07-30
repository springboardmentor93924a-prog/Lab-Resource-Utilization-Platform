package com.infosys.labresource.user.DTOs;

import com.infosys.labresource.user.entites.Role;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequestDTO {

    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String phone;
    private Role role;
    private Long institutionId;
    private Long departmentId;
}

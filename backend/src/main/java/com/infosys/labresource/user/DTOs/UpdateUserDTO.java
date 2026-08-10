package com.infosys.labresource.user.DTOs;

import com.infosys.labresource.user.entites.Role;
import lombok.Data;

@Data

public class UpdateUserDTO {
    private String firstName;

    private String lastName;

    private String phone;

    private Long departmentId;
}

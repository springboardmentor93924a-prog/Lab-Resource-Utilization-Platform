package com.infosys.labresource.user.Service;

import com.infosys.labresource.user.DTOs.LoginRequestDTO;
import com.infosys.labresource.user.DTOs.RegisterRequestDTO;
import com.infosys.labresource.user.entites.Department;
import com.infosys.labresource.user.entites.Institution;
import com.infosys.labresource.user.entites.UserEntity;

public interface UserService {

    Institution createInstitution(Institution institution);

    Department createDepartment(Department department);

    UserEntity registerUser(RegisterRequestDTO request);

    UserEntity loginUser(LoginRequestDTO request);
}

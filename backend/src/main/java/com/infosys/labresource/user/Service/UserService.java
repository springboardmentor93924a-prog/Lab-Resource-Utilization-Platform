package com.infosys.labresource.user.Service;

import com.infosys.labresource.user.DTOs.LoginRequestDTO;
import com.infosys.labresource.user.DTOs.RegisterRequestDTO;
import com.infosys.labresource.user.DTOs.UpdateUserDTO;
import com.infosys.labresource.user.entites.Department;
import com.infosys.labresource.user.entites.Institution;
import com.infosys.labresource.user.entites.UserEntity;
import org.springframework.security.core.Authentication;

import java.util.List;

public interface UserService {

    UserEntity registerUser(RegisterRequestDTO request);

    List<UserEntity> getAllUsers(Authentication authentication);

    UserEntity getUserByEmail(String email,Authentication auth);

    UserEntity updateUser(String email, UpdateUserDTO request);

    void deleteUser(String email,Authentication auth);
}

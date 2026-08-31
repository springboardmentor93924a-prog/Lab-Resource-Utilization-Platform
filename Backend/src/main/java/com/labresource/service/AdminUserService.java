package com.labresource.service;

import com.labresource.dto.CreateUserRequest;
import com.labresource.entity.User;

import java.util.List;

import org.springframework.security.core.Authentication;

public interface AdminUserService {

    User createUser(
            CreateUserRequest request,
            Authentication authentication
    );
    List<User> getTechnicians();
}
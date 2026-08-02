package com.labresource.service;

import com.labresource.dto.request.UserRequest;
import com.labresource.dto.response.UserResponse;

import java.util.List;

public interface UserService {
    List<UserResponse> getAllUsers();
    UserResponse getUserById(String id);
    UserResponse createUser(UserRequest request);
    UserResponse updateUser(String id, UserRequest request);
    void deleteUser(String id);
}

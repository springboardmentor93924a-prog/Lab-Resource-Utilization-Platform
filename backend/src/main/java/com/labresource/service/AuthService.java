package com.labresource.service;

import com.labresource.dto.request.LoginRequest;
import com.labresource.dto.request.RegisterRequest;
import com.labresource.dto.response.AuthResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

}
package com.lab.labresource.service;

import com.lab.labresource.dto.LoginRequest;
import com.lab.labresource.dto.LoginResponse;

public interface AuthService {

    LoginResponse login(LoginRequest request);

}

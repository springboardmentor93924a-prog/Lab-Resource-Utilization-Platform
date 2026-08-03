package com.labresource.backend.service;

import com.labresource.backend.dto.RegisterRequest;
import com.labresource.backend.entity.Role;
import com.labresource.backend.entity.User;
import com.labresource.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthenticationService {

    private final UserRepository repository;
    private final PasswordEncoder encoder;

    public AuthenticationService(UserRepository repository,
                                 PasswordEncoder encoder){

        this.repository=repository;
        this.encoder=encoder;
    }

    public String register(RegisterRequest request){

        if(repository.existsByEmail(request.getEmail())){
            return "Email already exists";
        }

        User user=new User();

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());

        user.setPassword(
                encoder.encode(request.getPassword())
        );

        user.setPhone(request.getPhone());

        user.setRole(
                Role.valueOf(request.getRole().toUpperCase())
        );

        repository.save(user);

        return "Registration Successful";
    }

}
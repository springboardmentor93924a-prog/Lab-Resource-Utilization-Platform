package com.labresource.security;

import com.labresource.entity.Role;
import com.labresource.entity.User;
import com.labresource.repository.UserRepository;

import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.stereotype.Service;


@Service
public class CurrentUserService {

    private final UserRepository userRepository;


    public CurrentUserService(
            UserRepository userRepository
    ) {

        this.userRepository =
                userRepository;
    }


    // =========================================================
    // GET CURRENT AUTHENTICATED USER
    // =========================================================

    public User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();


        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof
                AnonymousAuthenticationToken) {

            throw new RuntimeException(
                    "User is not authenticated"
            );
        }


        String email =
                authentication.getName();


        return userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Authenticated user not found"
                        )
                );
    }


    // =========================================================
    // MANAGEMENT ACCESS
    // =========================================================

    public boolean hasManagementAccess() {

        User user =
                getCurrentUser();


        Role role =
                user.getRole();


        return role == Role.LAB_MANAGER
                || role == Role.DEPARTMENT_HEAD
                || role == Role.INSTITUTION_ADMIN
                || role == Role.SYSTEM_ADMIN;
    }
}
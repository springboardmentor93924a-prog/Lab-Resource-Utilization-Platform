package com.labresource.security;

import com.labresource.entity.Role;
import com.labresource.entity.User;
import com.labresource.repository.UserRepository;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.stereotype.Service;

import java.util.Set;


@Service
public class SecurityService {

    private final UserRepository userRepository;


    public SecurityService(
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


        if (authentication == null ||
                !authentication.isAuthenticated() ||
                authentication.getName() == null) {

            throw new AccessDeniedException(
                    "User is not authenticated"
            );
        }


        String email =
                authentication.getName();


        return userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new AccessDeniedException(
                                "Authenticated user not found"
                        )
                );
    }


    // =========================================================
    // MANAGEMENT ROLES
    // =========================================================

    public boolean isManagementUser(
            User user
    ) {

        Set<Role> managementRoles =
                Set.of(

                        Role.LAB_MANAGER,

                        Role.DEPARTMENT_HEAD,

                        Role.INSTITUTION_ADMIN,

                        Role.SYSTEM_ADMIN
                );


        return managementRoles.contains(
                user.getRole()
        );
    }


    // =========================================================
    // CHECK USER OWNERSHIP
    // =========================================================

    public void checkOwnership(
            Long resourceUserId
    ) {

        User currentUser =
                getCurrentUser();


        /*
         * Management users can access
         * other users' resources.
         */

        if (isManagementUser(
                currentUser
        )) {

            return;
        }


        /*
         * Normal users can access
         * only their own resources.
         */

        if (resourceUserId == null ||
                !resourceUserId.equals(
                        currentUser.getId()
                )) {

            throw new AccessDeniedException(
                    "You are not allowed to access this resource"
            );
        }
    }


    // =========================================================
    // CHECK USER ID ACCESS
    //
    // Used for endpoints like:
    //
    // /api/bookings/user/{userId}
    //
    // /api/waitlists/user/{userId}
    // =========================================================

    public void checkUserAccess(
            Long requestedUserId
    ) {

        User currentUser =
                getCurrentUser();


        /*
         * Management users can view
         * any user's resources.
         */

        if (isManagementUser(
                currentUser
        )) {

            return;
        }


        if (!currentUser.getId().equals(
                requestedUserId
        )) {

            throw new AccessDeniedException(
                    "You are not allowed to access another user's data"
            );
        }
    }
}
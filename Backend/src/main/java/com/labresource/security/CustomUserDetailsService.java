
package com.labresource.security;

import com.labresource.entity.User;
import com.labresource.repository.UserRepository;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomUserDetailsService
        implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(
            UserRepository userRepository) {

        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(
            String email)
            throws UsernameNotFoundException {

        User user =
                userRepository.findByEmail(
                        email
                ).orElseThrow(() ->
                        new UsernameNotFoundException(
                                "User not found: " + email
                        )
                );

        /*
         * IMPORTANT:
         *
         * Spring Security hasRole("LAB_MANAGER")
         * expects the authority:
         *
         * ROLE_LAB_MANAGER
         *
         * Therefore we MUST add "ROLE_" here.
         */

        String authority =
                "ROLE_" + user.getRole().name();

        System.out.println(
                "=========================================="
        );

        System.out.println(
                "LOGIN USER: " + user.getEmail()
        );

        System.out.println(
                "DATABASE ROLE: " + user.getRole()
        );

        System.out.println(
                "SPRING AUTHORITY: " + authority
        );

        System.out.println(
                "=========================================="
        );

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),

                List.of(
                        new SimpleGrantedAuthority(
                                authority
                        )
                )
        );
    }
}

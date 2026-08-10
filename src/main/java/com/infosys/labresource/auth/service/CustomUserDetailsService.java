package com.infosys.labresource.auth.service;

import com.infosys.labresource.user.Repository.UserRepository;
import com.infosys.labresource.user.entites.UserEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {

        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found with email: " + email));
        System.out.println("=================================");
        System.out.println("LOGIN USER: " + user.getEmail());
        System.out.println("ROLE: " + user.getRole());
        System.out.println("ACTIVE: " + user.getIsActive());
        System.out.println("PASSWORD HASH: " + user.getPassword());
        System.out.println("=================================");

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .authorities("ROLE_" + user.getRole().name())
                .disabled(!user.getIsActive())
                .build();
    }
}

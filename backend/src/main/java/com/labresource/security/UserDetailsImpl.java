package com.labresource.security;

import com.labresource.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

public class UserDetailsImpl implements UserDetails {

    private final User user;

    public UserDetailsImpl(User user) {
        this.user = user;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {

        if (user.getRole() == null || user.getRole().getName() == null) {
            return Collections.emptyList();
        }

        String authority = "ROLE_" + user.getRole().getName().name();

        return Collections.singletonList(
                new SimpleGrantedAuthority(authority)
        );
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public String getUsername() {
        return user.getEmail();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {

        if (user.getStatus() == null) {
            return true;
        }

        return user.getStatus().equalsIgnoreCase("ACTIVE");
    }

    public User getUser() {
        return user;
    }
}
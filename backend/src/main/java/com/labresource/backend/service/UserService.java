package com.labresource.backend.service;

import com.labresource.backend.entity.User;
import com.labresource.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository repository;

    public UserService(UserRepository repository) {
        this.repository = repository;
    }

    public User save(User user) {
        return repository.save(user);
    }

    public List<User> getAll() {
        return repository.findAll();
    }

    public User getByEmail(String email) {
        return repository.findByEmail(email).orElse(null);
    }
    public User login(String email, String password) {

    User user = repository.findByEmail(email).orElse(null);

    if (user == null) {
        return null;
    }

    if (user.getPassword().equals(password)) {
        return user;
    }

    return null;
}
}

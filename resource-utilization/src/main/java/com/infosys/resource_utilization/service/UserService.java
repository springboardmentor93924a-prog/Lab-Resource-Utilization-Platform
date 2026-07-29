package com.infosys.resource_utilization.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.infosys.resource_utilization.entity.User;
import com.infosys.resource_utilization.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User saveUser(User user) {
        return userRepository.save(user);
    }
    public User getUserById(Long id) {
    return userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));
}

public User updateUser(Long id, User user) {
    User existing = getUserById(id);

    existing.setName(user.getName());
    existing.setEmail(user.getEmail());
    existing.setPassword(user.getPassword());
    existing.setRole(user.getRole());
    existing.setDepartment(user.getDepartment());

    return userRepository.save(existing);
}

public void deleteUser(Long id) {
    userRepository.deleteById(id);
}
}

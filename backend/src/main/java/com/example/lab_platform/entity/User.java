package com.example.lab_platform.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Integer userId;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(name = "email", nullable = false, unique = true, length = 100)
    private String email;

    // Never serialize the password hash back to the frontend — every
    // endpoint that returns a User (directly, or nested under Booking/
    // Waitlist/Maintenance/etc.) was previously leaking the BCrypt hash.
    @JsonIgnore
    @Column(name = "password", nullable = false, length = 255)
    private String password;

    @Column(name = "phone", length = 15)
    private String phone;

    @ManyToOne
    @JoinColumn(name = "role_id")
    private Role role;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(
        name = "department_id")
    private Department department;

    @Column(name = "status", length = 20)
    private String status = "Active";

    // Why a registration was rejected (shown to the applicant on login and in
    // the rejection email). Empty for every other status.
    @Column(name = "status_reason", length = 255)
    private String statusReason;

    // A new Institution Admin whose college doesn't exist yet: the
    // requested college is stored here until the System Admin approves,
    // at which point the institution is created and linked to this user.
    @Column(name = "requested_institution_name", length = 150)
    private String requestedInstitutionName;

    @Column(name = "requested_institution_location", length = 200)
    private String requestedInstitutionLocation;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.EAGER)
@JoinColumn(
        // Nullable: SYSTEM_ADMIN accounts are platform-wide and are not
        // tied to any single institution (see UserService.registerUserInternal).
        // This was previously "nullable = false", which matched the DB's
        // NOT NULL constraint and blocked SYSTEM_ADMIN registration with
        // a constraint-violation error even after the service-layer logic
        // was updated to allow it.
        name = "institution_id",
        nullable = true
)
private Institution institution;

    public User() {
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public Department getDepartment() {
        return department;
    }

    public void setDepartment(Department department) {
        this.department = department;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Institution getInstitution() {
    return institution;
}

public void setInstitution(Institution institution) {
    this.institution = institution;
}


    public String getRequestedInstitutionName() {
        return requestedInstitutionName;
    }

    public void setRequestedInstitutionName(String requestedInstitutionName) {
        this.requestedInstitutionName = requestedInstitutionName;
    }

    public String getRequestedInstitutionLocation() {
        return requestedInstitutionLocation;
    }

    public void setRequestedInstitutionLocation(String requestedInstitutionLocation) {
        this.requestedInstitutionLocation = requestedInstitutionLocation;
    }

    public String getStatusReason() {
        return statusReason;
    }

    public void setStatusReason(String statusReason) {
        this.statusReason = statusReason;
    }
}
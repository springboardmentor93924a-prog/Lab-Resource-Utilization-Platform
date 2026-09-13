package com.labresource.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
    name = "users",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = "email")
    }
)
public class User {

    @Id
    @GeneratedValue(
        strategy = GenerationType.IDENTITY
    )
    private Long id;

    @Column(
        name = "full_name",
        nullable = false
    )
    private String fullName;

    @Column(
        nullable = false,
        unique = true
    )
    private String email;

    @Column(
        nullable = false
    )
    @JsonIgnore
    private String password;

    @Enumerated(
        EnumType.STRING
    )
    @Column(
        nullable = false
    )
    private Role role;


    // =========================================================
    // PASSWORD RESET
    // =========================================================

    @Column(
        name = "password_reset_token"
    )
    @JsonIgnore
    private String passwordResetToken;


    @Column(
        name = "password_reset_token_expiry"
    )
    @JsonIgnore
    private LocalDateTime passwordResetTokenExpiry;


    // =========================================================
    // INSTITUTION
    // =========================================================

    @ManyToOne(
        fetch = FetchType.LAZY
    )
    @JoinColumn(
        name = "institution_id"
    )
    @JsonIgnore
    private Institution institution;


    // =========================================================
    // DEPARTMENT
    // =========================================================

    @ManyToOne(
        fetch = FetchType.LAZY
    )
    @JoinColumn(
        name = "department_id"
    )
    @JsonIgnore
    private Department department;


    // =========================================================
    // CREATED DATE
    // =========================================================

    @Column(
        name = "created_at",
        nullable = false
    )
    private LocalDateTime createdAt;


    // =========================================================
    // RELATIONSHIPS
    // =========================================================

    @OneToMany(
        mappedBy = "user"
    )
    private List<Booking> bookings =
            new ArrayList<>();


    @OneToMany(
        mappedBy = "user"
    )
    private List<Waitlist> waitlists =
            new ArrayList<>();


    // =========================================================
    // PRE PERSIST
    // =========================================================

    @PrePersist
    protected void onCreate() {

        createdAt =
                LocalDateTime.now();
    }


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public User() {
    }


    // =========================================================
    // ID
    // =========================================================

    public Long getId() {
        return id;
    }

    public void setId(
            Long id
    ) {
        this.id = id;
    }


    // =========================================================
    // FULL NAME
    // =========================================================

    public String getFullName() {
        return fullName;
    }

    public void setFullName(
            String fullName
    ) {
        this.fullName = fullName;
    }


    // =========================================================
    // EMAIL
    // =========================================================

    public String getEmail() {
        return email;
    }

    public void setEmail(
            String email
    ) {
        this.email = email;
    }


    // =========================================================
    // PASSWORD
    // =========================================================

    public String getPassword() {
        return password;
    }

    public void setPassword(
            String password
    ) {
        this.password = password;
    }


    // =========================================================
    // ROLE
    // =========================================================

    public Role getRole() {
        return role;
    }

    public void setRole(
            Role role
    ) {
        this.role = role;
    }


    // =========================================================
    // PASSWORD RESET TOKEN
    // =========================================================

    public String getPasswordResetToken() {
        return passwordResetToken;
    }

    public void setPasswordResetToken(
            String passwordResetToken
    ) {
        this.passwordResetToken =
                passwordResetToken;
    }


    // =========================================================
    // PASSWORD RESET TOKEN EXPIRY
    // =========================================================

    public LocalDateTime
    getPasswordResetTokenExpiry() {

        return passwordResetTokenExpiry;
    }

    public void setPasswordResetTokenExpiry(
            LocalDateTime passwordResetTokenExpiry
    ) {

        this.passwordResetTokenExpiry =
                passwordResetTokenExpiry;
    }


    // =========================================================
    // INSTITUTION
    // =========================================================

    public Institution getInstitution() {
        return institution;
    }

    public void setInstitution(
            Institution institution
    ) {
        this.institution =
                institution;
    }


    // =========================================================
    // DEPARTMENT
    // =========================================================

    public Department getDepartment() {
        return department;
    }

    public void setDepartment(
            Department department
    ) {
        this.department =
                department;
    }


    // =========================================================
    // CREATED AT
    // =========================================================

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }


    // =========================================================
    // BOOKINGS
    // =========================================================

    public List<Booking> getBookings() {
        return bookings;
    }


    // =========================================================
    // WAITLISTS
    // =========================================================

    public List<Waitlist> getWaitlists() {
        return waitlists;
    }
}
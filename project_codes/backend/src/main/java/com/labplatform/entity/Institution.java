package com.labplatform.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "institutions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Institution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private String address;
    private String city;
    private String country;
    private String contactEmail;
    private String contactPhone;

    @OneToMany(mappedBy = "institution", cascade = CascadeType.ALL)
    @Builder.Default
    @JsonIgnore
    private List<User> users = new java.util.ArrayList<>();

    @OneToMany(mappedBy = "institution", cascade = CascadeType.ALL)
    @Builder.Default
    @JsonIgnore
    private List<Equipment> equipment = new java.util.ArrayList<>();

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}

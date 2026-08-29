package com.labplatform.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "institutions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Institution {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false, unique = true)
    private String code;
    
    private String address;
    private String contactEmail;
    
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
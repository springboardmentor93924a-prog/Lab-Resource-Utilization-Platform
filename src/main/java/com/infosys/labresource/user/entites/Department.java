package com.infosys.labresource.user.entites;

import jakarta.persistence.*;
import lombok.*;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter

public class Department {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long departId;
    @Column(nullable = false)
    private String departmentName;

    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institution_id", nullable = false)
    private Institution institution;

}

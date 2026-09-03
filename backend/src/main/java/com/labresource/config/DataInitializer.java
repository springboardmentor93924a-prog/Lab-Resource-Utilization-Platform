package com.labresource.config;

import com.labresource.entity.Department;
import com.labresource.entity.Institution;
import com.labresource.entity.Role;
import com.labresource.enums.RoleType;
import com.labresource.repository.DepartmentRepository;
import com.labresource.repository.InstitutionRepository;
import com.labresource.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(1)
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final InstitutionRepository institutionRepository;
    private final DepartmentRepository departmentRepository;

    public DataInitializer(
            RoleRepository roleRepository,
            InstitutionRepository institutionRepository,
            DepartmentRepository departmentRepository
    ) {
        this.roleRepository = roleRepository;
        this.institutionRepository = institutionRepository;
        this.departmentRepository = departmentRepository;
    }

    @Override
    public void run(String... args) {

        createDefaultRoles();

        Institution institution = createDefaultInstitution();

        createDefaultDepartment(institution);
    }

    private void createDefaultRoles() {

        createRole(
                RoleType.SUPER_ADMIN,
                "Manages the complete platform"
        );

        createRole(
                RoleType.INSTITUTION_ADMIN,
                "Manages institution users, departments and equipment"
        );

        createRole(
                RoleType.LAB_MANAGER,
                "Manages laboratory equipment and bookings"
        );

        createRole(
                RoleType.TECHNICIAN,
                "Handles equipment maintenance and calibration"
        );

        createRole(
                RoleType.FACULTY,
                "Faculty member who can book laboratory equipment"
        );

        createRole(
                RoleType.RESEARCHER,
                "Researcher who can request laboratory equipment"
        );

        createRole(
                RoleType.STUDENT,
                "Student who can request laboratory equipment"
        );
    }

    private void createRole(
            RoleType roleType,
            String description
    ) {

        if (!roleRepository.existsByName(roleType)) {

            Role role = new Role();

            role.setName(roleType);
            role.setDescription(description);

            roleRepository.save(role);

            System.out.println("Role created: " + roleType);
        }
    }

    private Institution createDefaultInstitution() {

        if (institutionRepository.count() > 0) {

            Institution institution =
                    institutionRepository.findAll().get(0);

            System.out.println(
                    "Existing Institution ID: "
                            + institution.getId()
            );

            return institution;
        }

        Institution institution = new Institution();

        institution.setName("DY Patil International University");
        institution.setEmail("admin@dypiu.ac.in");
        institution.setPhone("9876543210");
        institution.setAddress("Akurdi");
        institution.setCity("Pune");
        institution.setState("Maharashtra");
        institution.setCountry("India");
        institution.setStatus("ACTIVE");

        Institution savedInstitution =
                institutionRepository.save(institution);

        System.out.println(
                "Institution created with ID: "
                        + savedInstitution.getId()
        );

        return savedInstitution;
    }

    private void createDefaultDepartment(
            Institution institution
    ) {

        String departmentName =
                "Computer Science and Engineering";

        boolean departmentExists =
                departmentRepository
                        .existsByNameAndInstitution(
                                departmentName,
                                institution
                        );

        if (departmentExists) {

            Department existingDepartment =
                    departmentRepository
                            .findByInstitution(institution)
                            .stream()
                            .filter(department ->
                                    departmentName.equals(
                                            department.getName()
                                    )
                            )
                            .findFirst()
                            .orElse(null);

            if (existingDepartment != null) {
                System.out.println(
                        "Existing Department ID: "
                                + existingDepartment.getId()
                );
            }

            return;
        }

        Department department = new Department();

        department.setName(departmentName);
        department.setDescription(
                "Computer Science and Engineering Department"
        );
        department.setInstitution(institution);

        Department savedDepartment =
                departmentRepository.save(department);

        System.out.println(
                "Department created with ID: "
                        + savedDepartment.getId()
        );
    }
}
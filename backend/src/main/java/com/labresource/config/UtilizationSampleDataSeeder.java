package com.labresource.config;

import com.labresource.entity.Booking;
import com.labresource.entity.Department;
import com.labresource.entity.Equipment;
import com.labresource.entity.EquipmentCategory;
import com.labresource.entity.Institution;
import com.labresource.entity.Role;
import com.labresource.entity.User;
import com.labresource.entity.UtilizationLog;
import com.labresource.enums.RoleType;
import com.labresource.repository.BookingRepository;
import com.labresource.repository.DepartmentRepository;
import com.labresource.repository.EquipmentCategoryRepository;
import com.labresource.repository.EquipmentRepository;
import com.labresource.repository.InstitutionRepository;
import com.labresource.repository.RoleRepository;
import com.labresource.repository.UserRepository;
import com.labresource.repository.UtilizationLogRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

/**
 * Seeds realistic Equipment / User / Booking / UtilizationLog data so
 * that, on a fresh database, the Utilization dashboard and heatmap
 * (Lab Manager / Department Head) show real, varied data instead of
 * "No data available" placeholders.
 * <p>
 * This runs once: every step is idempotent (it checks for existing
 * data before inserting), so re-starting the app will not duplicate
 * records.
 */
@Component
@Order(2)
public class UtilizationSampleDataSeeder implements CommandLineRunner {

    private static final String DEFAULT_PASSWORD = "Password123!";

    private final InstitutionRepository institutionRepository;
    private final DepartmentRepository departmentRepository;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final EquipmentCategoryRepository equipmentCategoryRepository;
    private final EquipmentRepository equipmentRepository;
    private final BookingRepository bookingRepository;
    private final UtilizationLogRepository utilizationLogRepository;
    private final PasswordEncoder passwordEncoder;

    private final Random random = new Random(42);

    public UtilizationSampleDataSeeder(
            InstitutionRepository institutionRepository,
            DepartmentRepository departmentRepository,
            RoleRepository roleRepository,
            UserRepository userRepository,
            EquipmentCategoryRepository equipmentCategoryRepository,
            EquipmentRepository equipmentRepository,
            BookingRepository bookingRepository,
            UtilizationLogRepository utilizationLogRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.institutionRepository = institutionRepository;
        this.departmentRepository = departmentRepository;
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.equipmentCategoryRepository = equipmentCategoryRepository;
        this.equipmentRepository = equipmentRepository;
        this.bookingRepository = bookingRepository;
        this.utilizationLogRepository = utilizationLogRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {

        Institution institution = getFirstInstitution();
        if (institution == null) {
            System.out.println(
                    "[UtilizationSampleDataSeeder] No institution found, skipping seed."
            );
            return;
        }

        Department department = getFirstDepartment(institution);
        if (department == null) {
            System.out.println(
                    "[UtilizationSampleDataSeeder] No department found, skipping seed."
            );
            return;
        }

        EquipmentCategory category = ensureCategory();

        List<Equipment> equipmentList =
                ensureEquipment(institution, department, category);

        User labManager = ensureUser(
                institution, department, RoleType.LAB_MANAGER,
                "Priya", "Nair", "labmanager@dypiu.ac.in"
        );

        List<User> studentUsers = new ArrayList<>();
        studentUsers.add(ensureUser(
                institution, department, RoleType.STUDENT,
                "Arjun", "Mehta", "arjun.mehta@dypiu.ac.in"
        ));
        studentUsers.add(ensureUser(
                institution, department, RoleType.STUDENT,
                "Sneha", "Kulkarni", "sneha.kulkarni@dypiu.ac.in"
        ));
        studentUsers.add(ensureUser(
                institution, department, RoleType.FACULTY,
                "Dr. Rohan", "Deshpande", "rohan.deshpande@dypiu.ac.in"
        ));

        if (labManager != null) {
            System.out.println(
                    "[UtilizationSampleDataSeeder] Lab manager login: "
                            + labManager.getEmail()
                            + " / " + DEFAULT_PASSWORD
            );
        }

        seedBookingsAndUtilizationLogs(equipmentList, studentUsers);
    }

    private Institution getFirstInstitution() {

        List<Institution> institutions = institutionRepository.findAll();

        return institutions.isEmpty() ? null : institutions.get(0);
    }

    private Department getFirstDepartment(Institution institution) {

        List<Department> departments =
                departmentRepository.findByInstitution(institution);

        return departments.isEmpty() ? null : departments.get(0);
    }

    private EquipmentCategory ensureCategory() {

        if (equipmentCategoryRepository.existsByName("Lab Instruments")) {

            return equipmentCategoryRepository.findAll()
                    .stream()
                    .filter(c -> "Lab Instruments".equals(c.getName()))
                    .findFirst()
                    .orElse(null);
        }

        EquipmentCategory category = new EquipmentCategory();
        category.setName("Lab Instruments");
        category.setDescription("General laboratory instruments and analyzers");
        category.setCreatedAt(LocalDateTime.now());

        return equipmentCategoryRepository.save(category);
    }

    private List<Equipment> ensureEquipment(
            Institution institution,
            Department department,
            EquipmentCategory category
    ) {

        List<Equipment> existing = equipmentRepository.findAll();

        if (!existing.isEmpty()) {
            return existing;
        }

        String[][] equipmentSeed = new String[][]{
                {"High-Speed Centrifuge", "CENT-1001", "Eppendorf"},
                {"UV-Vis Spectrophotometer", "SPEC-2002", "Thermo Fisher"},
                {"PCR Thermal Cycler", "PCR-3003", "Bio-Rad"},
                {"Electron Microscope", "EM-4004", "Zeiss"},
                {"Gas Chromatograph", "GC-5005", "Agilent"}
        };

        List<Equipment> created = new ArrayList<>();

        for (String[] seed : equipmentSeed) {

            Equipment equipment = new Equipment();

            equipment.setInstitution(institution);
            equipment.setDepartment(department);
            equipment.setCategory(category);
            equipment.setName(seed[0]);
            equipment.setSerialNumber(seed[1]);
            equipment.setManufacturer(seed[2]);
            equipment.setDescription(
                    "Shared laboratory equipment used for research and coursework."
            );
            equipment.setLocation("Main Lab Building");
            equipment.setStatus("ACTIVE");
            equipment.setAvailabilityStatus("AVAILABLE");
            equipment.setPurchaseDate(LocalDate.now().minusYears(1));
            equipment.setCreatedAt(LocalDateTime.now());
            equipment.setUpdatedAt(LocalDateTime.now());

            created.add(equipmentRepository.save(equipment));
        }

        System.out.println(
                "[UtilizationSampleDataSeeder] Seeded "
                        + created.size() + " equipment records."
        );

        return created;
    }

    private User ensureUser(
            Institution institution,
            Department department,
            RoleType roleType,
            String firstName,
            String lastName,
            String email
    ) {

        if (userRepository.existsByEmail(email)) {
            return userRepository.findByEmail(email).orElse(null);
        }

        Role role = roleRepository.findByName(roleType).orElse(null);

        if (role == null) {
            System.out.println(
                    "[UtilizationSampleDataSeeder] Role "
                            + roleType + " not found, skipping user " + email
            );
            return null;
        }

        User user = new User();

        user.setRole(role);
        user.setInstitution(institution);
        user.setDepartment(department);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(DEFAULT_PASSWORD));
        user.setStatus("ACTIVE");
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        return userRepository.save(user);
    }

    /**
     * Creates ~4 weeks of realistic bookings (weekday-heavy, business
     * hours) and a matching UtilizationLog for each one, so that
     * UtilizationAnalyticsService's 30-day window and the heatmap
     * immediately show a believable usage pattern (busy mid-week
     * mornings, quieter weekends) for every seeded piece of equipment.
     */
    private void seedBookingsAndUtilizationLogs(
            List<Equipment> equipmentList,
            List<User> users
    ) {

        if (equipmentList.isEmpty() || users.isEmpty()) {
            return;
        }

        if (utilizationLogRepository.count() > 0) {
            System.out.println(
                    "[UtilizationSampleDataSeeder] Utilization logs already exist, skipping."
            );
            return;
        }

        int[] businessHours = {9, 10, 11, 12, 13, 14, 15, 16};
        int createdCount = 0;

        for (Equipment equipment : equipmentList) {

            for (int daysAgo = 27; daysAgo >= 0; daysAgo--) {

                LocalDate date = LocalDate.now().minusDays(daysAgo);
                int dayOfWeek = date.getDayOfWeek().getValue(); // 1=Mon..7=Sun

                // Skip most weekend slots, and randomly skip some
                // weekday slots so usage isn't the same every day.
                boolean isWeekend = dayOfWeek >= 6;

                double usageChance = isWeekend ? 0.1 : 0.55;

                for (int hour : businessHours) {

                    if (random.nextDouble() > usageChance) {
                        continue;
                    }

                    LocalDateTime start = date.atTime(hour, 0);
                    LocalDateTime end = start.plusMinutes(
                            30 + random.nextInt(3) * 15
                    );

                    if (end.isAfter(LocalDateTime.now())) {
                        continue;
                    }

                    User user = users.get(random.nextInt(users.size()));

                    Booking booking = new Booking();
                    booking.setEquipment(equipment);
                    booking.setUser(user);
                    booking.setStartTime(start);
                    booking.setEndTime(end);
                    booking.setPurpose("Scheduled lab session");
                    booking.setBookingStatus("COMPLETED");
                    booking.setApprovalStatus("APPROVED");

                    Booking savedBooking =
                            bookingRepository.save(booking);

                    UtilizationLog log = new UtilizationLog();
                    log.setEquipment(equipment);
                    log.setUser(user);
                    log.setBooking(savedBooking);
                    log.setStartTime(start);
                    log.setEndTime(end);
                    log.setUtilizationSource("BOOKING");
                    log.setStatus("COMPLETED");
                    log.setUsageDurationMinutes(
                            (int) java.time.Duration
                                    .between(start, end)
                                    .toMinutes()
                    );

                    utilizationLogRepository.save(log);
                    createdCount++;
                }
            }
        }

        System.out.println(
                "[UtilizationSampleDataSeeder] Seeded "
                        + createdCount + " bookings + utilization logs."
        );
    }
}

package com.labresource.backend.systemadmin;

import org.junit.jupiter.api.Test;

import java.io.File;
import java.io.FileWriter;
import java.sql.*;
import java.util.*;

public class ReadOnlyDatabaseAuditRunnerTest {

    @Test
    public void runReadOnlyAudit() {
        String url = "jdbc:postgresql://localhost:5432/lab_resource_utilization";
        String user = "postgres";
        String pass = "postgres";

        try (Connection conn = DriverManager.getConnection(url, user, pass)) {

            // 1. Fetch Institutions
            Map<Long, Map<String, Object>> instMap = new LinkedHashMap<>();
            String instSql = "SELECT institution_id, name, code, approval_status, is_active FROM \"Institution\" ORDER BY institution_id";
            try (Statement stmt = conn.createStatement(); ResultSet rs = stmt.executeQuery(instSql)) {
                while (rs.next()) {
                    long id = rs.getLong("institution_id");
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("institution_id", id);
                    map.put("name", rs.getString("name"));
                    map.put("code", rs.getString("code"));
                    map.put("approval_status", rs.getString("approval_status"));
                    map.put("is_active", rs.getBoolean("is_active"));
                    instMap.put(id, map);
                }
            }

            // 2. Fetch User Roles
            Map<Long, List<String>> userRolesMap = new HashMap<>();
            String roleSql = "SELECT ur.user_id, r.role_name FROM \"UserRole\" ur JOIN \"Role\" r ON ur.role_id = r.role_id";
            try (Statement stmt = conn.createStatement(); ResultSet rs = stmt.executeQuery(roleSql)) {
                while (rs.next()) {
                    long uId = rs.getLong("user_id");
                    String rName = rs.getString("role_name");
                    userRolesMap.computeIfAbsent(uId, k -> new ArrayList<>()).add(rName);
                }
            }

            // 3. Fetch Departments
            Map<Long, Map<String, Object>> deptMap = new LinkedHashMap<>();
            String deptSql = "SELECT department_id, name, code, institution_id FROM \"Department\" ORDER BY department_id";
            try (Statement stmt = conn.createStatement(); ResultSet rs = stmt.executeQuery(deptSql)) {
                while (rs.next()) {
                    long id = rs.getLong("department_id");
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("department_id", id);
                    map.put("name", rs.getString("name"));
                    map.put("code", rs.getString("code"));
                    map.put("institution_id", rs.getObject("institution_id"));
                    deptMap.put(id, map);
                }
            }

            // 4. Fetch Users
            List<Map<String, Object>> users = new ArrayList<>();
            String userSql = "SELECT u.user_id, u.first_name, u.last_name, u.email, u.institution_id, i.name as inst_name, " +
                    "u.department_id, d.name as dept_name, u.is_active, u.password_hash, u.roll_number, u.researcher_id, u.created_at " +
                    "FROM \"AppUser\" u " +
                    "LEFT JOIN \"Institution\" i ON u.institution_id = i.institution_id " +
                    "LEFT JOIN \"Department\" d ON u.department_id = d.department_id " +
                    "ORDER BY u.user_id";

            try (Statement stmt = conn.createStatement(); ResultSet rs = stmt.executeQuery(userSql)) {
                while (rs.next()) {
                    Map<String, Object> map = new LinkedHashMap<>();
                    long uId = rs.getLong("user_id");
                    map.put("user_id", uId);
                    map.put("first_name", rs.getString("first_name"));
                    map.put("last_name", rs.getString("last_name"));
                    map.put("email", rs.getString("email"));
                    map.put("institution_id", rs.getObject("institution_id"));
                    map.put("inst_name", rs.getString("inst_name"));
                    map.put("department_id", rs.getObject("department_id"));
                    map.put("dept_name", rs.getString("dept_name"));
                    map.put("is_active", rs.getBoolean("is_active"));
                    map.put("has_password_hash", rs.getString("password_hash") != null && !rs.getString("password_hash").isBlank());
                    map.put("roll_number", rs.getString("roll_number"));
                    map.put("researcher_id", rs.getString("researcher_id"));
                    map.put("created_at", rs.getString("created_at"));
                    map.put("roles", userRolesMap.getOrDefault(uId, Collections.emptyList()));
                    users.add(map);
                }
            }

            // Format markdown report
            StringBuilder sb = new StringBuilder();
            sb.append("# DATABASE USER INVENTORY REPORT\n\n");

            // Group users by institution
            Map<Long, List<Map<String, Object>>> usersByInst = new LinkedHashMap<>();
            List<Map<String, Object>> globalUsers = new ArrayList<>();

            for (Map<String, Object> u : users) {
                Long instId = (Long) u.get("institution_id");
                if (instId == null) {
                    globalUsers.add(u);
                } else {
                    usersByInst.computeIfAbsent(instId, k -> new ArrayList<>()).add(u);
                }
            }

            sb.append("## Platform Global Users (No Institution)\n");
            sb.append("Total Global Users: ").append(globalUsers.size()).append("\n\n");
            sb.append("| User ID | Name | Email | Role | Department | Active | Password Set |\n");
            sb.append("|---------|------|-------|------|------------|--------|--------------|\n");
            for (Map<String, Object> u : globalUsers) {
                sb.append("| ").append(u.get("user_id"))
                        .append(" | ").append(u.get("first_name")).append(" ").append(u.get("last_name") != null ? u.get("last_name") : "")
                        .append(" | ").append(u.get("email"))
                        .append(" | ").append(String.join(", ", (List<String>) u.get("roles")))
                        .append(" | ").append(u.get("dept_name") != null ? u.get("dept_name") : "—")
                        .append(" | ").append(Boolean.TRUE.equals(u.get("is_active")) ? "YES" : "NO")
                        .append(" | ").append(Boolean.TRUE.equals(u.get("has_password_hash")) ? "YES" : "NO")
                        .append(" |\n");
            }
            sb.append("\n");

            for (Map.Entry<Long, Map<String, Object>> entry : instMap.entrySet()) {
                Long instId = entry.getKey();
                Map<String, Object> inst = entry.getValue();
                List<Map<String, Object>> instUserList = usersByInst.getOrDefault(instId, Collections.emptyList());

                sb.append("## Institution ID: ").append(instId).append(" — ").append(inst.get("name")).append("\n");
                sb.append("Code: ").append(inst.get("code") != null ? inst.get("code") : "—")
                        .append(" | Approval Status: ").append(inst.get("approval_status"))
                        .append(" | Active: ").append(inst.get("is_active"))
                        .append(" | Total Users: ").append(instUserList.size()).append("\n\n");

                if (instUserList.isEmpty()) {
                  sb.append("*No users registered under this institution.*\n\n");
                } else {
                  sb.append("| User ID | Name | Email | Role | Department | Active | Password Set |\n");
                  sb.append("|---------|------|-------|------|------------|--------|--------------|\n");
                  for (Map<String, Object> u : instUserList) {
                      sb.append("| ").append(u.get("user_id"))
                              .append(" | ").append(u.get("first_name")).append(" ").append(u.get("last_name") != null ? u.get("last_name") : "")
                              .append(" | ").append(u.get("email"))
                              .append(" | ").append(String.join(", ", (List<String>) u.get("roles")))
                              .append(" | ").append(u.get("dept_name") != null ? u.get("dept_name") : "—")
                              .append(" | ").append(Boolean.TRUE.equals(u.get("is_active")) ? "YES" : "NO")
                              .append(" | ").append(Boolean.TRUE.equals(u.get("has_password_hash")) ? "YES" : "NO")
                              .append(" |\n");
                  }
                  sb.append("\n");
                }
            }

            File projectFile = new File("E:/Lab-Resource-Utilization-Platform/scratch_formatted_audit_report.md");
            try (FileWriter writer = new FileWriter(projectFile)) {
                writer.write(sb.toString());
            }
            System.out.println("Formatted audit report written to: " + projectFile.getAbsolutePath());

        } catch (Exception e) {
            System.err.println("Failed to connect or query PostgreSQL: " + e.getMessage());
            e.printStackTrace();
        }
    }
}

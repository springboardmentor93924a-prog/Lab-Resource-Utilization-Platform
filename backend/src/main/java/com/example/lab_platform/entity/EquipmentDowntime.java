package com.example.lab_platform.entity;

import jakarta.persistence.*;
import java.time.Duration;
import java.time.LocalDateTime;

@Entity
@Table(name = "equipment_downtime")
public class EquipmentDowntime {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "downtime_id")
    private Integer downtimeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipment_id", nullable = false)
    private Equipment equipment;

    // The work order (if any) this downtime window was opened for.
    // Nullable — a downtime window can also be logged manually with no
    // work order behind it (e.g. an unplanned outage discovered by a
    // technician before a work order is raised).
    //
    // NOTE: as of this database snapshot, public.equipment_downtime has
    // no "work_order_id" column yet — see CHANGED_FILES.md section 9 for
    // the one-line ALTER TABLE needed before this field will work.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "work_order_id")
    private WorkOrder workOrder;

    // The scheduled/preventive Maintenance record (if any) this downtime
    // window is associated with. Maps to the pre-existing
    // "maintenance_id" column + FK that were already present in the
    // database (equipment_downtime -> maintenance) but were previously
    // unmapped in this entity entirely. Nullable, additive — does not
    // replace workOrder above; a downtime window can be tied to either,
    // both, or neither.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maintenance_id")
    private Maintenance maintenance;

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @Column(name = "reason")
    private String reason;

    @Column(name = "downtime_status", length = 30)
    private String downtimeStatus;

    public EquipmentDowntime() {
    }

    public Integer getDowntimeId() {
        return downtimeId;
    }

    public void setDowntimeId(Integer downtimeId) {
        this.downtimeId = downtimeId;
    }

    public Equipment getEquipment() {
        return equipment;
    }

    public void setEquipment(Equipment equipment) {
        this.equipment = equipment;
    }

    public WorkOrder getWorkOrder() {
        return workOrder;
    }

    public void setWorkOrder(WorkOrder workOrder) {
        this.workOrder = workOrder;
    }

    public Maintenance getMaintenance() {
        return maintenance;
    }

    public void setMaintenance(Maintenance maintenance) {
        this.maintenance = maintenance;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getDowntimeStatus() {
        return downtimeStatus;
    }

    public void setDowntimeStatus(String downtimeStatus) {
        this.downtimeStatus = downtimeStatus;
    }

    /*
     * Duration is deliberately NOT a stored/live-ticking value — it is
     * derived on demand from the two persisted timestamps only.
     * - If endDate has not been recorded yet, the window is still
     *   ongoing and duration is unknown/not reported (never computed
     *   against the current clock).
     * - Once endDate is stored, duration is fixed and simply the
     *   difference between the two stored timestamps.
     */
    @Transient
    public Long getDurationMinutes() {
        if (startDate == null || endDate == null) {
            return null;
        }
        return Duration.between(startDate, endDate).toMinutes();
    }
}

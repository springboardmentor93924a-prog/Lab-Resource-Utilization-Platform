package com.example.lab_platform.service;

import com.example.lab_platform.entity.Waitlist;

import java.util.List;

public interface WaitlistService {

    Waitlist joinWaitlist(Waitlist waitlist);

    List<Waitlist> getAllWaitlistEntries();

    List<Waitlist> getWaitlistForEquipment(Integer equipmentId);

    List<Waitlist> getMyWaitlistEntries();

    void cancelWaitlistEntry(Integer waitlistId);

    // Called when the user responds to the "couldn't allocate your slot"
    // notification (see BookingServiceImpl.processWaitlistForEquipment,
    // which puts the entry into AWAITING_DECISION in the first place).
    // decision must be "REBOOK" or "EXIT" — both close the entry out as
    // CANCELLED, the same terminal status used everywhere else a
    // waitlist entry gets closed (including the timeout sweep in
    // EquipmentStatusScheduler, if nobody decides in time). There's
    // no separate "rejected" state — Cancelled covers every way an
    // entry can end.
    // Only allowed while the entry is still AWAITING_DECISION, and only
    // by the user who owns it.
    Waitlist decideOnMissedWindow(Integer waitlistId, String decision);
}
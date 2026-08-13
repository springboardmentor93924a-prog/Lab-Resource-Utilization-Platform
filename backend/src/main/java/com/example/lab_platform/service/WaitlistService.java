package com.example.lab_platform.service;

import com.example.lab_platform.entity.Waitlist;

import java.util.List;

public interface WaitlistService {

    Waitlist joinWaitlist(Waitlist waitlist);

    List<Waitlist> getAllWaitlistEntries();

    List<Waitlist> getWaitlistForEquipment(Integer equipmentId);

    List<Waitlist> getMyWaitlistEntries();

    void cancelWaitlistEntry(Integer waitlistId);
}
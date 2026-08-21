package com.example.lab_platform.service;

import com.example.lab_platform.entity.EquipmentFeedback;

import java.util.List;

public interface EquipmentFeedbackService {

    List<EquipmentFeedback> getAllFeedback();

    List<EquipmentFeedback> getFeedbackByEquipment(Integer equipmentId);

    EquipmentFeedback submitFeedback(EquipmentFeedback feedback);

    EquipmentFeedback updateStatus(Integer id, String status);
}
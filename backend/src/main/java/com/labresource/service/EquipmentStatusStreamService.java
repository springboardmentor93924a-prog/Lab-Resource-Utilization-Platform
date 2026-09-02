package com.labresource.service;

import com.labresource.dto.EquipmentStatusEventDto;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

public interface EquipmentStatusStreamService {
    SseEmitter subscribe();
    void publish(EquipmentStatusEventDto event);
}

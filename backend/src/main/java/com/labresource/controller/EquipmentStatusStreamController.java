package com.labresource.controller;

import com.labresource.service.EquipmentStatusStreamService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/realtime")
public class EquipmentStatusStreamController {

    private final EquipmentStatusStreamService equipmentStatusStreamService;

    public EquipmentStatusStreamController(
            EquipmentStatusStreamService equipmentStatusStreamService) {
        this.equipmentStatusStreamService = equipmentStatusStreamService;
    }

    @GetMapping(value = "/equipment-status",
            produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter equipmentStatusStream() {
        return equipmentStatusStreamService.subscribe();
    }
}

package com.example.lab_platform.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    /*
     * A role that fails @PreAuthorize throws AccessDeniedException, which
     * is itself a RuntimeException. Without this dedicated handler it was
     * caught by the generic one below and came back as a confusing
     * "400 Bad Request" instead of a proper 403 Forbidden. Spring picks the
     * most specific handler, so this one wins for access-denied errors.
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, String>> handleAccessDenied(AccessDeniedException ex) {

        Map<String, String> body = new HashMap<>();
        body.put("message", "You do not have permission to perform this action");

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(body);
    }

    /*
     * Catches every RuntimeException thrown across the app
     * (business-rule violations like "already booked", "not
     * allowed to...", "equipment not found", etc.) and returns
     * it as a proper JSON body the frontend can read, instead
     * of Spring's default message-less error page.
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException ex) {

        Map<String, String> body = new HashMap<>();
        body.put("message", ex.getMessage());

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(body);
    }
}
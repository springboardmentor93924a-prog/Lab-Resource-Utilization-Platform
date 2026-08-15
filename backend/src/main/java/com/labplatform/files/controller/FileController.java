package com.labplatform.files.controller;

import com.labplatform.files.service.FileStorageService;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Files;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private final FileStorageService fileStorageService;

    public FileController(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadFile(
            @RequestParam("file") MultipartFile file) {

        String storedFilename = fileStorageService.storeFile(file);

        return ResponseEntity.ok(
                Map.of(
                        "filename", storedFilename,
                        "originalName",
                        file.getOriginalFilename() != null
                                ? file.getOriginalFilename()
                                : ""
                )
        );
    }

    @GetMapping("/{filename:.+}")
    public ResponseEntity<Resource> downloadFile(
            @PathVariable String filename) {

        Path filePath = fileStorageService.loadFile(filename);

        Resource resource;

        try {
            resource = new UrlResource(filePath.toUri());
        } catch (MalformedURLException ex) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error reading file"
            );
        }

        if (!resource.exists() || !resource.isReadable()) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.NOT_FOUND,
                    "File cannot be read: " + filename
            );
        }

        String contentType;

        try {
            contentType = Files.probeContentType(filePath);
        } catch (IOException ex) {
            contentType = null;
        }

        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + filename + "\""
                )
                .body(resource);
    }
}
package com.labresource.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "documents")
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "document_id")
    private Long documentId;

    @Column(name = "equipment_id")
    private Long equipmentId;

    @Column(name = "uploaded_by", nullable = false, insertable = false, updatable = false)
    private Long uploadedBy;

    @ManyToOne
    @JoinColumn(name = "uploaded_by", nullable = false)
    private User user;

    @Column(name = "document_name", nullable = false, length = 150)
    private String documentName;

    @Column(name = "document_type", length = 50)
    private String documentType;

    @Column(name = "file_path", nullable = false, length = 255)
    private String filePath;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "uploaded_at")
    private String uploadedAt;

    @Column(name = "remarks", length = 255)
    private String remarks;

    // Default Constructor
    public Document() {
    }

    // Parameterized Constructor
    public Document(Long documentId,
                    Long equipmentId,
                    Long uploadedBy,
                    String documentName,
                    String documentType,
                    String filePath,
                    Long fileSize,
                    String uploadedAt,
                    String remarks) {

        this.documentId = documentId;
        this.equipmentId = equipmentId;
        this.uploadedBy = uploadedBy;
        this.documentName = documentName;
        this.documentType = documentType;
        this.filePath = filePath;
        this.fileSize = fileSize;
        this.uploadedAt = uploadedAt;
        this.remarks = remarks;
    }

    public Long getDocumentId() {
        return documentId;
    }

    public void setDocumentId(Long documentId) {
        this.documentId = documentId;
    }

    public Long getEquipmentId() {
        return equipmentId;
    }

    public void setEquipmentId(Long equipmentId) {
        this.equipmentId = equipmentId;
    }

    public Long getUploadedBy() {
        return uploadedBy;
    }

    public void setUploadedBy(Long uploadedBy) {
        this.uploadedBy = uploadedBy;
    }

    public String getDocumentName() {
        return documentName;
    }

    public void setDocumentName(String documentName) {
        this.documentName = documentName;
    }

    public String getDocumentType() {
        return documentType;
    }

    public void setDocumentType(String documentType) {
        this.documentType = documentType;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public String getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(String uploadedAt) {
        this.uploadedAt = uploadedAt;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
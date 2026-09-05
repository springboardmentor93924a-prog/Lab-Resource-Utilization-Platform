package com.example.lab_platform.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "invoice_line_items")
public class InvoiceLineItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "line_item_id")
    private Integer lineItemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false)
    private Invoice invoice;

    @Column(name = "description", nullable = false, length = 255)
    private String description;

    @Column(name = "amount", nullable = false)
    private Double amount;

    // Source of this line item - one of these two, for traceability.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usage_cost_id")
    private EquipmentUsageCost usageCost;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chargeback_id")
    private ChargebackRequest chargeback;

    public Integer getLineItemId() {
        return lineItemId;
    }

    public void setLineItemId(Integer lineItemId) {
        this.lineItemId = lineItemId;
    }

    public Invoice getInvoice() {
        return invoice;
    }

    public void setInvoice(Invoice invoice) {
        this.invoice = invoice;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public EquipmentUsageCost getUsageCost() {
        return usageCost;
    }

    public void setUsageCost(EquipmentUsageCost usageCost) {
        this.usageCost = usageCost;
    }

    public ChargebackRequest getChargeback() {
        return chargeback;
    }

    public void setChargeback(ChargebackRequest chargeback) {
        this.chargeback = chargeback;
    }
}
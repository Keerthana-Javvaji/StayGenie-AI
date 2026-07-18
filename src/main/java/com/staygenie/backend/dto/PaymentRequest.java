package com.staygenie.backend.dto;

public class PaymentRequest {

    private Long amount;

    public PaymentRequest() {
    }

    public PaymentRequest(Long amount) {
        this.amount = amount;
    }

    public Long getAmount() {
        return amount;
    }

    public void setAmount(Long amount) {
        this.amount = amount;
    }
}
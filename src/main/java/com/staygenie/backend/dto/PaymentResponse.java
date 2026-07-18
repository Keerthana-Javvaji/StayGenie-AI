package com.staygenie.backend.dto;

public class PaymentResponse {

    private String clientSecret;

    public PaymentResponse() {
    }

    public PaymentResponse(String clientSecret) {
        this.clientSecret = clientSecret;
    }

    public String getClientSecret() {
        return clientSecret;
    }

    public void setClientSecret(String clientSecret) {
        this.clientSecret = clientSecret;
    }
}
package com.demo.features.payments.dto;

public record PreferenceResponse(
        String id,
        String initPoint,
        String sandboxInitPoint,
        PaymentResponse payment
) {
}

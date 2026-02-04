package com.demo.infrastructure.payments;

import com.mercadopago.MercadoPagoConfig;
import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.client.preference.PreferenceBackUrlsRequest;
import com.mercadopago.client.preference.PreferenceClient;
import com.mercadopago.client.preference.PreferenceItemRequest;
import com.mercadopago.client.preference.PreferencePayerRequest;
import com.mercadopago.client.preference.PreferenceRequest;
import com.mercadopago.resources.payment.Payment;
import com.mercadopago.resources.preference.Preference;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Service
public class MercadoPagoService {

    private final PreferenceClient preferenceClient;
    private final PaymentClient paymentClient;
    private final String appUrl;
    private final boolean isConfigured;

    public MercadoPagoService(
            @Value("${app.mercadopago.access-token:}") String accessToken,
            @Value("${app.url:http://localhost:3000}") String appUrl
    ) {
        this.appUrl = appUrl;

        if (accessToken != null && !accessToken.isBlank()) {
            MercadoPagoConfig.setAccessToken(accessToken);
            this.preferenceClient = new PreferenceClient();
            this.paymentClient = new PaymentClient();
            this.isConfigured = true;
            log.info("MercadoPago configured successfully");
        } else {
            this.preferenceClient = null;
            this.paymentClient = null;
            this.isConfigured = false;
            log.warn("MercadoPago access token not configured");
        }
    }

    public PreferenceResult createPreference(
            String title,
            String description,
            int quantity,
            BigDecimal unitPrice,
            String externalReference,
            String payerEmail
    ) {
        if (!isConfigured) {
            throw new RuntimeException("MercadoPago not configured - missing access token");
        }

        try {
            PreferenceItemRequest item = PreferenceItemRequest.builder()
                    .id(externalReference)
                    .title(title)
                    .description(description)
                    .quantity(quantity)
                    .currencyId("BRL")
                    .unitPrice(unitPrice)
                    .build();

            PreferenceBackUrlsRequest backUrls = PreferenceBackUrlsRequest.builder()
                    .success(appUrl + "/api/payments/success")
                    .failure(appUrl + "/api/payments/failure")
                    .pending(appUrl + "/api/payments/pending")
                    .build();

            PreferenceRequest.PreferenceRequestBuilder requestBuilder = PreferenceRequest.builder()
                    .items(List.of(item))
                    .externalReference(externalReference)
                    .backUrls(backUrls)
                    .notificationUrl(appUrl + "/webhooks/mercadopago");

            if (payerEmail != null && !payerEmail.isBlank()) {
                PreferencePayerRequest payer = PreferencePayerRequest.builder()
                        .email(payerEmail)
                        .build();
                requestBuilder.payer(payer);
            }

            Preference preference = preferenceClient.create(requestBuilder.build());

            log.info("Preference created: {}", preference.getId());

            return new PreferenceResult(
                    preference.getId(),
                    preference.getInitPoint(),
                    preference.getSandboxInitPoint()
            );
        } catch (Exception e) {
            log.error("Failed to create preference: {}", e.getMessage());
            throw new RuntimeException("Failed to create payment preference", e);
        }
    }

    public PaymentResult getPayment(String paymentId) {
        if (!isConfigured) {
            throw new RuntimeException("MercadoPago not configured - missing access token");
        }

        try {
            Payment payment = paymentClient.get(Long.parseLong(paymentId));

            return new PaymentResult(
                    payment.getId().toString(),
                    payment.getStatus().toLowerCase(),
                    payment.getExternalReference(),
                    payment.getPaymentTypeId()
            );
        } catch (Exception e) {
            log.error("Failed to get payment {}: {}", paymentId, e.getMessage());
            throw new RuntimeException("Failed to get payment information", e);
        }
    }

    public record PreferenceResult(String id, String initPoint, String sandboxInitPoint) {}

    public record PaymentResult(String id, String status, String externalReference, String paymentType) {}
}

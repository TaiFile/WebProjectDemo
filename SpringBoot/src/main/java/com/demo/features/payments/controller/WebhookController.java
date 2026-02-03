package com.demo.features.payments.controller;

import com.demo.features.payments.service.PaymentService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/webhooks")
@RequiredArgsConstructor
@Tag(name = "Webhooks", description = "Endpoints de webhook para integraÃƒÂ§ÃƒÂµes")
public class WebhookController {

    private final PaymentService paymentService;

    @PostMapping("/mercadopago")
    @Operation(summary = "Webhook do MercadoPago")
    public ResponseEntity<Void> mercadoPagoWebhook(@RequestBody Map<String, Object> data) {
        log.info("MercadoPago webhook received: {}", data);

        try {
            paymentService.processWebhook(data);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error processing MercadoPago webhook", e);
            return ResponseEntity.ok().build();
        }
    }
}

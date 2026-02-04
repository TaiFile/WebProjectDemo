package com.demo.features.payments.service;

import com.demo.features.payments.repository.PaymentRepository;

import com.demo.common.exception.ResourceNotFoundException;
import com.demo.features.payments.dto.CreatePreferenceRequest;
import com.demo.features.payments.dto.PaymentResponse;
import com.demo.features.payments.dto.PreferenceResponse;
import com.demo.domain.User;
import com.demo.domain.Payment;
import com.demo.features.users.repository.UserRepository;
import com.demo.infrastructure.payments.MercadoPagoService;
import com.demo.infrastructure.payments.MercadoPagoService.PreferenceResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final MercadoPagoService mercadoPagoService;

    @Transactional
    public PreferenceResponse createPreference(String userId, CreatePreferenceRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("UsuÃƒÂ¯Ã‚Â¿Ã‚Â½rio nÃƒÂ¯Ã‚Â¿Ã‚Â½o encontrado"));

        BigDecimal totalAmount = request.unitPrice().multiply(BigDecimal.valueOf(request.quantity()));

        Payment payment = Payment.builder()
                .title(request.title())
                .description(request.description())
                .quantity(request.quantity())
                .unitPrice(request.unitPrice())
                .amount(totalAmount)
                .status(Payment.PaymentStatus.PENDING)
                .user(user)
                .build();

        payment = paymentRepository.save(payment);

        PreferenceResult preferenceResult = mercadoPagoService.createPreference(
                request.title(),
                request.description(),
                request.quantity(),
                request.unitPrice(),
                payment.getId(),
                request.payerEmail()
        );

        payment.setPreferenceId(preferenceResult.id());
        payment.setInitPoint(preferenceResult.initPoint());
        payment.setSandboxInitPoint(preferenceResult.sandboxInitPoint());
        payment = paymentRepository.save(payment);

        log.info("Preference created: {} for user {}", preferenceResult.id(), userId);

        return new PreferenceResponse(
                preferenceResult.id(),
                preferenceResult.initPoint(),
                preferenceResult.sandboxInitPoint(),
                mapToResponse(payment)
        );
    }

    public List<PaymentResponse> getUserHistory(String userId) {
        return paymentRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public PaymentResponse getById(String id, String userId) {
        Payment payment = paymentRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Pagamento nÃƒÂ¯Ã‚Â¿Ã‚Â½o encontrado"));

        return mapToResponse(payment);
    }

    @Transactional
    public void processWebhook(Map<String, Object> data) {
        String type = (String) data.get("type");

        if ("payment".equals(type)) {
            @SuppressWarnings("unchecked")
            Map<String, Object> paymentData = (Map<String, Object>) data.get("data");
            String paymentId = String.valueOf(paymentData.get("id"));

            if (paymentId.contains("-")) {
                log.info("Mock payment ID detected: {}", paymentId);
                return;
            }

            try {
                var mpPayment = mercadoPagoService.getPayment(paymentId);

                if (mpPayment != null) {
                    String externalReference = mpPayment.externalReference();
                    Payment.PaymentStatus status = mapMercadoPagoStatus(mpPayment.status());

                    paymentRepository.findById(externalReference)
                            .ifPresent(payment -> {
                                payment.setExternalId(paymentId);
                                payment.setStatus(status);
                                payment.setPaymentType(mpPayment.paymentType());
                                paymentRepository.save(payment);

                                log.info("Payment updated via webhook: {} - Status: {}", 
                                        payment.getId(), status);
                            });
                }
            } catch (Exception e) {
                log.error("Error processing webhook for payment {}: {}", paymentId, e.getMessage());
            }
        }
    }

    private Payment.PaymentStatus mapMercadoPagoStatus(String mpStatus) {
        return switch (mpStatus) {
            case "approved" -> Payment.PaymentStatus.APPROVED;
            case "rejected" -> Payment.PaymentStatus.REJECTED;
            case "cancelled" -> Payment.PaymentStatus.CANCELLED;
            case "in_process", "pending" -> Payment.PaymentStatus.IN_PROCESS;
            case "refunded" -> Payment.PaymentStatus.REFUNDED;
            default -> Payment.PaymentStatus.PENDING;
        };
    }

    private PaymentResponse mapToResponse(Payment payment) {
        return new PaymentResponse(
                payment.getId(),
                payment.getExternalReference(),
                payment.getPreferenceId(),
                payment.getDescription(),
                payment.getDescription(),
                1, // quantity hardcoded
                payment.getAmount(),
                payment.getAmount(),
                payment.getStatus(),
                null, // paymentType
                null, // initPoint
                null, // sandboxInitPoint
                payment.getUser().getId(),
                payment.getCreatedAt(),
                payment.getUpdatedAt()
        );
    }
}

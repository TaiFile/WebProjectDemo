package com.demo.features.payments.controller;

import com.demo.features.payments.service.PaymentService;

import com.demo.common.security.CurrentUser;
import com.demo.common.security.UserPrincipal;
import com.demo.features.payments.dto.CreatePreferenceRequest;
import com.demo.features.payments.dto.PaymentResponse;
import com.demo.features.payments.dto.PreferenceResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Gerenciamento de pagamentos")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-preference")
    @Operation(summary = "Criar preferÃƒÂªncia de pagamento")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<PreferenceResponse> createPreference(
            @CurrentUser UserPrincipal currentUser,
            @Valid @RequestBody CreatePreferenceRequest request
    ) {
        PreferenceResponse response = paymentService.createPreference(currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/user/history")
    @Operation(summary = "HistÃƒÂ³rico de pagamentos do usuÃƒÂ¡rio")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<List<PaymentResponse>> getUserHistory(@CurrentUser UserPrincipal currentUser) {
        List<PaymentResponse> response = paymentService.getUserHistory(currentUser.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter pagamento por ID")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<PaymentResponse> getById(
            @PathVariable String id,
            @CurrentUser UserPrincipal currentUser
    ) {
        PaymentResponse response = paymentService.getById(id, currentUser.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping(value = "/success", produces = MediaType.TEXT_HTML_VALUE)
    @Operation(summary = "PÃƒÂ¡gina de sucesso do pagamento")
    public void paymentSuccess(
            @RequestParam(required = false) String payment_id,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String external_reference,
            @RequestParam(required = false) String payment_type,
            HttpServletResponse response
    ) throws IOException {
        String html = """
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Pagamento Aprovado</title>
                <style>
                    body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); }
                    .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); text-align: center; max-width: 500px; }
                    .success-icon { font-size: 80px; color: #4CAF50; margin-bottom: 20px; }
                    h1 { color: #333; margin-bottom: 10px; }
                    p { color: #666; line-height: 1.6; }
                    .info { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 20px; text-align: left; }
                    .info-item { margin: 8px 0; font-size: 14px; }
                    .label { font-weight: bold; color: #555; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="success-icon">Ã¢Å“â€¦</div>
                    <h1>Pagamento Aprovado!</h1>
                    <p>Seu pagamento foi processado com sucesso.</p>
                    <div class="info">
                        <div class="info-item"><span class="label">ID:</span> %s</div>
                        <div class="info-item"><span class="label">Status:</span> %s</div>
                        <div class="info-item"><span class="label">Tipo:</span> %s</div>
                        <div class="info-item"><span class="label">Ref:</span> %s</div>
                    </div>
                    <p style="margin-top: 20px; font-size: 14px; color: #999;">VocÃƒÂª pode fechar esta janela.</p>
                </div>
            </body>
            </html>
            """.formatted(
                payment_id != null ? payment_id : "N/A",
                status != null ? status : "approved",
                payment_type != null ? payment_type : "N/A",
                external_reference != null ? external_reference : "N/A"
            );
        
        response.setContentType(MediaType.TEXT_HTML_VALUE);
        response.getWriter().write(html);
    }

    @GetMapping(value = "/failure", produces = MediaType.TEXT_HTML_VALUE)
    @Operation(summary = "PÃƒÂ¡gina de falha do pagamento")
    public void paymentFailure(
            @RequestParam(required = false) String payment_id,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String external_reference,
            HttpServletResponse response
    ) throws IOException {
        String html = """
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Pagamento Recusado</title>
                <style>
                    body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); }
                    .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); text-align: center; max-width: 500px; }
                    .error-icon { font-size: 80px; color: #f44336; margin-bottom: 20px; }
                    h1 { color: #333; margin-bottom: 10px; }
                    p { color: #666; line-height: 1.6; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="error-icon">Ã¢ÂÅ’</div>
                    <h1>Pagamento Recusado</h1>
                    <p>Infelizmente seu pagamento nÃƒÂ£o foi aprovado.</p>
                    <p>Por favor, tente novamente ou use outro mÃƒÂ©todo de pagamento.</p>
                    <p style="margin-top: 20px; font-size: 14px; color: #999;">VocÃƒÂª pode fechar esta janela.</p>
                </div>
            </body>
            </html>
            """;
        
        response.setContentType(MediaType.TEXT_HTML_VALUE);
        response.getWriter().write(html);
    }

    @GetMapping(value = "/pending", produces = MediaType.TEXT_HTML_VALUE)
    @Operation(summary = "PÃƒÂ¡gina de pagamento pendente")
    public void paymentPending(
            @RequestParam(required = false) String payment_id,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String external_reference,
            HttpServletResponse response
    ) throws IOException {
        String html = """
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Pagamento Pendente</title>
                <style>
                    body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); }
                    .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); text-align: center; max-width: 500px; }
                    .pending-icon { font-size: 80px; color: #FF9800; margin-bottom: 20px; }
                    h1 { color: #333; margin-bottom: 10px; }
                    p { color: #666; line-height: 1.6; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="pending-icon">Ã¢ÂÂ³</div>
                    <h1>Pagamento Pendente</h1>
                    <p>Seu pagamento estÃƒÂ¡ sendo processado.</p>
                    <p>VocÃƒÂª receberÃƒÂ¡ uma notificaÃƒÂ§ÃƒÂ£o quando for confirmado.</p>
                    <p style="margin-top: 20px; font-size: 14px; color: #999;">VocÃƒÂª pode fechar esta janela.</p>
                </div>
            </body>
            </html>
            """;
        
        response.setContentType(MediaType.TEXT_HTML_VALUE);
        response.getWriter().write(html);
    }
}

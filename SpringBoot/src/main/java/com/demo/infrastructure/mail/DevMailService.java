package com.demo.infrastructure.mail;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

/**
 * MailService para ambiente de desenvolvimento que apenas loga os emails no console
 * em vez de realmente enviá-los via SMTP.
 *
 * Para usar: Mantenha spring.profiles.active=dev no application.yml
 * Para emails reais: Mude para spring.profiles.active=prod
 */
@Slf4j
@Service
@Primary
@Profile("dev")
public class DevMailService implements IMailService {

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    public void sendEmail(String to, String subject, String htmlContent) {
        log.info("\n");
        log.info("📧 ========================================");
        log.info("📧      EMAIL CAPTURADO (DEV MODE)      ");
        log.info("📧 ========================================");
        log.info("📬 Para: {}", to);
        log.info("📝 Assunto: {}", subject);
        log.info("📧 ========================================");
        log.info("📄 Conteúdo HTML:");
        log.info("---");
        // Mostra apenas a parte importante (link)
        if (htmlContent.contains("href=")) {
            String link = extractLink(htmlContent);
            if (link != null) {
                log.info("🔗 Link de confirmação:");
                log.info("   {}", link);
            }
        }
        log.info("---");
        log.info("💡 Para ver o HTML completo, use MailHog ou Mailtrap");
        log.info("📧 ========================================\n");
    }

    public void sendConfirmationEmail(String email, String token) {
        String confirmationUrl = frontendUrl + "/auth/confirm-email?token=" + token;

        log.info("\n");
        log.info("✉️  ========================================");
        log.info("✉️       EMAIL DE CONFIRMAÇÃO (DEV)      ");
        log.info("✉️  ========================================");
        log.info("📬 Para: {}", email);
        log.info("📝 Assunto: ✉️ Confirme seu email");
        log.info("🔗 Link de confirmação:");
        log.info("   {}", confirmationUrl);
        log.info("⏰ Token expira em: 24 horas");
        log.info("✉️  ========================================");
        log.info("💡 Para testar, copie o link acima e cole no navegador ou faça:");
        log.info("   curl \"http://localhost:3000/api/auth/confirm-email?token={}\"", token);
        log.info("✉️  ========================================\n");
    }

    public void sendResetPasswordEmail(String email, String token) {
        String resetUrl = frontendUrl + "/auth/reset-password?token=" + token;

        log.info("\n");
        log.info("🔐 ========================================");
        log.info("🔐    EMAIL DE RESET DE SENHA (DEV)     ");
        log.info("🔐 ========================================");
        log.info("📬 Para: {}", email);
        log.info("📝 Assunto: 🔒 Redefinir senha");
        log.info("🔗 Link de reset:");
        log.info("   {}", resetUrl);
        log.info("⏰ Token expira em: 1 hora");
        log.info("🔐 ========================================");
        log.info("💡 Para testar o reset, use este token: {}", token);
        log.info("🔐 ========================================\n");
    }

    private String extractLink(String html) {
        try {
            int hrefStart = html.indexOf("href=\"") + 6;
            int hrefEnd = html.indexOf("\"", hrefStart);
            if (hrefStart > 5 && hrefEnd > hrefStart) {
                return html.substring(hrefStart, hrefEnd);
            }
        } catch (Exception e) {
            // Ignore
        }
        return null;
    }
}

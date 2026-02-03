package com.demo.infrastructure.mail;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.from:noreply@example.com}")
    private String fromEmail;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    @Async
    public void sendEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Email sent to: {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    public void sendConfirmationEmail(String email, String token) {
        String confirmationUrl = frontendUrl + "/auth/confirm-email?token=" + token;

        String html = """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                    .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Bem-vindo!</h1>
                    </div>
                    <div class="content">
                        <h2>Confirme seu email</h2>
                        <p>Obrigado por se cadastrar! Para ativar sua conta, clique no botão abaixo:</p>
                        <p style="text-align: center;">
                            <a href="%s" class="button">Confirmar Email</a>
                        </p>
                        <p>Ou copie e cole este link no seu navegador:</p>
                        <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 4px;">%s</p>
                        <p><strong>⚠️ Este link expira em 24 horas.</strong></p>
                    </div>
                    <div class="footer">
                        <p>Se você não solicitou esta conta, ignore este email.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(confirmationUrl, confirmationUrl);

        sendEmail(email, "✉️ Confirme seu email", html);
    }

    public void sendResetPasswordEmail(String email, String token) {
        String resetUrl = frontendUrl + "/auth/reset-password?token=" + token;

        String html = """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #EF4444; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                    .button { display: inline-block; background: #EF4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔐 Redefinir Senha</h1>
                    </div>
                    <div class="content">
                        <h2>Você solicitou redefinição de senha</h2>
                        <p>Clique no botão abaixo para criar uma nova senha:</p>
                        <p style="text-align: center;">
                            <a href="%s" class="button">Redefinir Senha</a>
                        </p>
                        <p><strong>⚠️ Este link expira em 1 hora.</strong></p>
                    </div>
                    <div class="footer">
                        <p>Se você não solicitou esta redefinição, ignore este email.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(resetUrl);

        sendEmail(email, "🔐 Redefinir sua senha", html);
    }
}

package com.demo.infrastructure.mail;

/**
 * Interface comum para serviços de email.
 * Implementações:
 * - DevMailService: Loga emails no console (perfil: dev)
 * - MailService: Envia emails reais via SMTP (perfil: prod)
 */
public interface IMailService {

    void sendEmail(String to, String subject, String htmlContent);

    void sendConfirmationEmail(String email, String token);

    void sendResetPasswordEmail(String email, String token);
}

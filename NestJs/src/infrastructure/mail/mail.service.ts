import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

/**
 * Serviço de email usando Nodemailer
 *
 * Suporta:
 * - SMTP (Gmail, Outlook, etc)
 * - Ethereal (para testes)
 * - Qualquer provedor SMTP
 *
 * Configurar no .env:
 * - MAIL_HOST (ex: smtp.gmail.com)
 * - MAIL_PORT (ex: 587)
 * - MAIL_USER (seu email)
 * - MAIL_PASSWORD (senha de app)
 * - MAIL_FROM (email de envio)
 */
@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    await this.createTransporter();
  }

  /**
   * Cria o transporter do Nodemailer
   * Se não houver configuração, usa Ethereal (fake SMTP para testes)
   */
  private async createTransporter(): Promise<void> {
    const host = this.configService.get<string>('MAIL_HOST');
    const port = this.configService.get<number>('MAIL_PORT');
    const user = this.configService.get<string>('MAIL_USER');
    const pass = this.configService.get<string>('MAIL_PASSWORD');
    const isDev = this.configService.get<string>('NODE_ENV') !== 'production';

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: port || 587,
        secure: port === 465, // true para 465, false para outras portas
        auth: {
          user,
          pass,
        },
        // Em desenvolvimento, ignorar erros de certificado SSL
        tls: isDev ? { rejectUnauthorized: false } : undefined,
      });

      this.logger.log(`📧 Mail service configured with SMTP: ${host}`);
      if (isDev) {
        this.logger.warn('📧 TLS certificate verification disabled (dev mode)');
      }
    } else {
      // Usar Ethereal para testes (fake SMTP)
      const testAccount = await nodemailer.createTestAccount();

      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
        tls: { rejectUnauthorized: false },
      });

      this.logger.warn('📧 Mail service using Ethereal (test mode)');
      this.logger.warn(`📧 Ethereal user: ${testAccount.user}`);
    }
  }

  async sendEmail(options: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  }): Promise<void> {
    const fromEmail = this.configService.get<string>('MAIL_FROM') || 'noreply@example.com';

    const mailOptions = {
      from: fromEmail,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`📧 Email enviado para: ${options.to}`);
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        this.logger.log(`📧 Preview URL: ${previewUrl}`);
      }
    } catch (error) {
      this.logger.error(`❌ Erro ao enviar email para ${options.to}:`, error.message);
      throw error;
    }
  }

  async sendConfirmationEmail(email: string, token: string): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const confirmationUrl = `${frontendUrl}/auth/confirm-email?token=${token}`;

    await this.sendEmail({
      to: email,
      subject: '✉️ Confirme seu email',
      html: `
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
                <a href="${confirmationUrl}" class="button">Confirmar Email</a>
              </p>
              <p>Ou copie e cole este link no seu navegador:</p>
              <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 4px;">${confirmationUrl}</p>
              <p><strong>⚠️ Este link expira em 24 horas.</strong></p>
            </div>
            <div class="footer">
              <p>Se você não solicitou esta conta, ignore este email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Bem-vindo! Confirme seu email acessando: ${confirmationUrl}. Este link expira em 24 horas.`,
    });
  }

  async sendResetPasswordEmail(email: string, token: string): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/auth/reset-password?token=${token}`;

    await this.sendEmail({
      to: email,
      subject: '🔐 Redefinir sua senha',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #DC2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #DC2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Redefinir Senha</h1>
            </div>
            <div class="content">
              <h2>Esqueceu sua senha?</h2>
              <p>Recebemos uma solicitação para redefinir sua senha. Clique no botão abaixo:</p>
              <p style="text-align: center;">
                <a href="${resetUrl}" class="button">Redefinir Senha</a>
              </p>
              <p>Ou copie e cole este link no seu navegador:</p>
              <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 4px;">${resetUrl}</p>
              <p><strong>⚠️ Este link expira em 1 hora.</strong></p>
            </div>
            <div class="footer">
              <p>Se você não solicitou a redefinição de senha, ignore este email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Redefinir senha: ${resetUrl}. Este link expira em 1 hora.`,
    });
  }
}

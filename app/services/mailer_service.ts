import nodemailer from 'nodemailer'
import env from '#start/env'

export default class MailerService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.get('MAILER_HOST'),
      port: Number(env.get('MAILER_PORT')),
      secure: true,
      logger: true,
      debug: true,
      auth: {
        user: env.get('MAILER_USER'),
        pass: env.get('MAILER_PASSWORD'),
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  public async sendEmail(targetEmail: string, subjectMessage: string, html: string) {
    const info = await this.transporter.sendMail({
      from: '"TASFRL" <info@tasfrl.org>',
      to: targetEmail,
      subject: subjectMessage,
      html,
    });
    console.log(info);
    return info;
  }

  public async sendContactNotification(contactData: {
    name: string;
    email: string;
    message: string;
    submissionId: number;
  }) {
    const { name, email, message, submissionId } = contactData;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Contact Form Submission</h2>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Submission ID:</strong> #${submissionId}</p>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <div style="background: white; padding: 15px; border-radius: 4px; margin-top: 10px;">
            ${message.replace(/\n/g, '<br>')}
          </div>
        </div>
        <p style="color: #666; font-size: 14px;">
          This message was submitted through the contact form on your website.
        </p>
      </div>
    `;

    // Send to admin email (you can configure this in your .env)
    const adminEmail = env.get('ADMIN_EMAIL', 'info@tasfrl.org');
    
    return await this.sendEmail(
      adminEmail,
      `New Contact Form Submission from ${name}`,
      html
    );
  }
}
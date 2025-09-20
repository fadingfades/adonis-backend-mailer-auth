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
}
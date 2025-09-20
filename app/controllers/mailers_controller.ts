import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core';
import MailerService from '#services/mailer_service';

@inject()
export default class MailersController {
    constructor(protected mailerService: MailerService) { }

    public async sendEmail({ request, response }: HttpContext) {
        const { targetEmail, subjectMessage, html } = request.only(['targetEmail', 'subjectMessage', 'html'])

        try {
            await this.mailerService.sendEmail(targetEmail, subjectMessage, html)
            return response.ok({ message: 'Email berhasil dikirim!' })
        } catch (error) {
            console.error('Email gagal dikirim:', error)
            return response.internalServerError({ message: 'Gagal mengirim email' })
        }
    }
}
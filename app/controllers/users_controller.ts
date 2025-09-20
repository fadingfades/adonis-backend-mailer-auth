import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { inject } from '@adonisjs/core';
import MailerService from '#services/mailer_service';

@inject()
export default class UsersController {
    constructor(protected mailerService: MailerService) { }
    async register({ request, response }: HttpContext) {
        const { fullName, email, password } = request.body()

        const user = await User.create({
            fullName,
            email,
            password
        })

        try {
            await this.mailerService.sendEmail(user.email, "Pembuatan Akun", "Akun anda telah berhasil dibuat!")
            return response.ok({ message: 'Email berhasil dikirim!' })
        } catch (error) {
            console.error({ message: 'Email gagal dikirim', error })
            return response.internalServerError({ message: 'Gagal mengirim email' })
        }
    }

    async login({ request }: HttpContext) {
        const { email, password } = request.body()
        const user = await User.verifyCredentials(email, password)
        const token = await User.accessTokens.create(user)

        return {
            type: 'bearer',
            value: token.value!.release()
        }
    }
}
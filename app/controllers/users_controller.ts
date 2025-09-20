import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { inject } from '@adonisjs/core'
import MailerService from '#services/mailer_service'
import { DateTime } from 'luxon'
import limiter from '@adonisjs/limiter/services/main'

function generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

@inject()
export default class UsersController {
    constructor(protected mailerService: MailerService) { }

    async register({ request, response }: HttpContext) {
        const { email, password } = request.only(['email', 'password'])

        const otp = generateOtp()
        const expiresAt = DateTime.now().plus({ minutes: 10 })

        const user = await User.create({
            email,
            password,
            otp_code: otp,
            otp_expires_at: expiresAt,
            otp_attempts: 0,
        })

        const host = `${request.protocol()}://${request.host()}`
        const verificationLink = `${host}/verify?verification_code=${otp}`

        try {
            await this.mailerService.sendEmail(
                user.email,
                'Verify Your Account',
                `Your OTP code is: ${otp}\n\nYou can also verify using this link:\n${verificationLink}`
            )

            return response.ok({ message: 'Email sent successfully!' })
        } catch (error) {
            console.error({ message: 'Failed to send the email', error })
            return response.internalServerError({ message: 'Email failed to send' })
        }
    }

    async login({ request }: HttpContext) {
        const { email, password } = request.only(['email', 'password'])
        const user = await User.verifyCredentials(email, password)
        const token = await User.accessTokens.create(user)

        return {
            type: 'bearer',
            value: token.value!.release(),
        }
    }

    async verifyOtp({ request, response }: HttpContext) {
        const { otp } = request.only(['otp'])

        const user = await User.findBy('otp_code', otp)
        if (!user) {
            return response.notFound({ message: 'User not found' })
        }

        if (user.is_verified) {
            return response.badRequest({ message: 'User is already verified' })
        }

        if (!user.otp_code || user.otp_code !== otp) {
            user.otp_attempts += 1
            await user.save()
            return response.badRequest({ message: 'Invalid OTP code' })
        }

        user.is_verified = true
        user.otp_code = null
        user.otp_expires_at = null
        user.otp_attempts = 0
        await user.save()

        return response.ok({ message: 'User verified successfully' })
    }

    async resendOtp({ request, response }: HttpContext) {
        const { email } = request.only(['email'])

        const limiterKey = `otp_resend:${email.toLowerCase()}`
        const otpLimiter = limiter.use({
            requests: 5,
            duration: 30 * 60,
        })

        const remaining = await otpLimiter.remaining(limiterKey)
        if (remaining <= 0) {
            return response.tooManyRequests({
                message: 'Too many OTP resend attempts. Please try again after 30 minutes',
            })
        }

        const user = await User.findBy('email', email)
        if (!user) {
            return response.notFound({ message: 'User not found' })
        }

        if (user.is_verified) {
            return response.badRequest({ message: 'User is already verified' })
        }

        const otp = generateOtp()
        const expiresAt = DateTime.now().plus({ minutes: 10 })

        user.otp_code = otp
        user.otp_expires_at = expiresAt
        user.otp_attempts = 0
        await user.save()

        const host = `${request.protocol()}://${request.host()}`
        const verificationLink = `${host}/verify?verification_code=${otp}`

        await this.mailerService.sendEmail(
            user.email,
            'Your new OTP code',
            `Your new OTP code is: ${otp}\n\nYou can also verify using this link:\n${verificationLink}`
        )

        await otpLimiter.increment(limiterKey)

        return response.ok({ message: 'OTP has been resent to your email' })
    }

    async verifyLink({ request, response }: HttpContext) {
        const { verification_code } = request.only(['verification_code'])

        const user = await User.findBy('otp_code', verification_code)
        if (!user) {
            return response.notFound({ message: 'User not found' })
        }

        if (user.is_verified) {
            return response.badRequest({ message: 'User is already verified' })
        }

        if (!user.otp_code || user.otp_code !== verification_code) {
            user.otp_attempts += 1
            await user.save()
            return response.badRequest({ message: 'Invalid OTP code' })
        }

        user.is_verified = true
        user.otp_code = null
        user.otp_expires_at = null
        user.otp_attempts = 0
        await user.save()

        return response.ok({ message: 'User verified successfully' })
    }
}

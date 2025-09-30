import type { HttpContext } from '@adonisjs/core/http'
import ContactSubmission from '#models/contact_submission'
import { inject } from '@adonisjs/core'
import MailerService from '#services/mailer_service'

@inject()
export default class ContactSubmissionsController {
    constructor(protected mailerService: MailerService) { }

    public async store({ request, response }: HttpContext) {
        try {
            const { name, email, message } = request.only(['name', 'email', 'message'])

            // Validate required fields
            if (!name || !email || !message) {
                return response.status(400).json({
                    error: 'All fields (name, email, message) are required'
                })
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(email)) {
                return response.status(400).json({
                    error: 'Invalid email format'
                })
            }

            // Validate message length
            if (message.length > 2000) {
                return response.status(400).json({
                    error: 'Message cannot exceed 2000 characters'
                })
            }

            // Create contact submission
            const contactSubmission = await ContactSubmission.create({
                name: name.trim(),
                email: email.trim().toLowerCase(),
                message: message.trim()
            })

            // Optional: Send notification email to admin
            try {
                await this.mailerService.sendContactNotification({
                    name,
                    email,
                    message,
                    submissionId: contactSubmission.id
                })
            } catch (emailError) {
                // Log email error but don't fail the request
                console.error('Failed to send contact notification email:', emailError)
            }

            return response.status(201).json({
                success: true,
                message: 'Contact submission received successfully',
                data: {
                    id: contactSubmission.id,
                    createdAt: contactSubmission.createdAt
                }
            })

        } catch (error) {
            console.error('Contact submission error:', error)
            return response.status(500).json({
                error: 'Internal server error. Please try again later.'
            })
        }
    }

    // Optional: Get all contact submissions (admin only)
    public async index({ response }: HttpContext) {
        try {
            const submissions = await ContactSubmission.query()
                .orderBy('created_at', 'desc')
                .limit(100)

            return response.json({
                success: true,
                data: submissions
            })
        } catch (error) {
            console.error('Error fetching contact submissions:', error)
            return response.status(500).json({
                error: 'Internal server error'
            })
        }
    }
}
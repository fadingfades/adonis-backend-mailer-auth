/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import MailersController from '#controllers/mailers_controller'
import UsersController from '#controllers/users_controller'
import { middleware } from './kernel.js'

router.get('/', async () => {
  return { message: 'Adonis is running' }
})

router.post('/api/send-email', [MailersController, 'sendEmail'])

router.get('/me', [UsersController, 'me']).middleware([middleware.cookie_to_bearer(), middleware.auth()])

router.post('/auth/register', [UsersController, 'register'])
router.post('/auth/login', [UsersController, 'login'])
router.post('/auth/logout', [UsersController, 'logout']).middleware([middleware.cookie_to_bearer(), middleware.auth()])

router.post('/verify-otp', [UsersController, 'verifyOtp'])
// router.get('/verify-otp', [UsersController, 'verifyLink'])
router.post('/resend-otp', [UsersController, 'resendOtp'])

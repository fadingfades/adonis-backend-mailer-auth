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
  return {
    nama: 'Anonim',
    umur: 32
  }
})

router.post('/api/send-email', [MailersController, 'sendEmail']).use(middleware.api_auth())

router.post('/auth/register', [UsersController, 'register']).use(middleware.api_auth())
router.post('/auth/login', [UsersController, 'login']).use(middleware.api_auth())

router.post('/verify-otp', [UsersController, 'verifyOtp']).use(middleware.api_auth())
router.get('/verify-otp', [UsersController, 'verifyLink']).use(middleware.api_auth())
router.post('/resend-otp', [UsersController, 'resendOtp']).use(middleware.api_auth())
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

router.post('/api/send-email', [MailersController, 'sendEmail']).use(middleware.mailer_auth())

router.post('/auth/register', [UsersController, 'register'])
router.post('/auth/login', [UsersController, 'login'])
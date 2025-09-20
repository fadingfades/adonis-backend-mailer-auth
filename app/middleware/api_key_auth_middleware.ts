import { HttpContext } from '@adonisjs/core/http'
import env from '#start/env'


export default class ApiKeyAuth {
  public async handle(ctx: HttpContext, next: () => Promise<void>) {
    const apiKey = ctx.request.header('x-api-key')
    const validApiKey = env.get('API_KEY_MAILER')

    if (!apiKey || apiKey !== validApiKey) {
      return ctx.response.unauthorized({ error: 'Invalid or missing API key' })
    }

    await next()
  }
}

import type { HttpContext } from '@adonisjs/core/http'

export default class CookieToBearer {
    public async handle(ctx: HttpContext, next: () => Promise<void>) {
        const authHeader = ctx.request.header('authorization')
        if (!authHeader) {
            const cookieToken = ctx.request.cookie('token')
            if (cookieToken) {
                ctx.request.request.headers['authorization'] = `Bearer ${cookieToken}`
            }
        }
        await next()
    }
}

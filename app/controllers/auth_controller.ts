import User from '#models/user'
import { LoginValidator, RegisterValidator } from '#validators/auth_validator'
import type { HttpContext } from '@adonisjs/core/http'

export default class AuthController {
  // login if we use authorization bearer
  async login({ request, response, auth }: HttpContext) {
    const { email, password } = await request.validateUsing(LoginValidator)

    const user = await User.verifyCredentials(email, password)

    const token = await User.accessTokens.create(user)

    return response.ok({
      token: token,
      ...user.serialize(),
    })
  }

  async register({ request, response }: HttpContext) {
    const payload = await request.validateUsing(RegisterValidator)
    
    const user = await User.create(payload)

    return response.created(user)
  }
}

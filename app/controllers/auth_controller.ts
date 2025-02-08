import User from '#models/user'
import {
  LoginRequestValidator,
  LoginResponseValidator,
  RegisterRequestValidator,
  RegisterResponseValidator,
} from '#validators/auth_validator'
import type { HttpContext } from '@adonisjs/core/http'
import env from '#start/env'

import { UserValidator } from '#validators/user_validator'
export default class AuthController {
  /**
   * @login
   * @requestBody <LoginRequestValidator>.append("cpf":"XXXXXXXXXXX", "email": "johndoe@gmail.com")
   * @responseBody 200 - <LoginResponseValidator>
   */
  async login({ request, response }: HttpContext) {
    const payload = await request.validateUsing(LoginRequestValidator)

    let user: User | undefined

    if ('email' in payload) {
      user = await User.verifyCredentials(payload.email, payload.password)
    } else {
      user = await User.verifyCredentials(payload.cpf, payload.password)
    }

    const tokenExpiration =
      env.get('TOKEN_EXPIRATION_IN_STRING') ?? env.get('TOKEN_EXPIRATION_IN_SECONDS')

    //TODO: Verificar se o último token registrado ligado àquele usuário ainda é válido e se sim retorná-lo
    const token = await User.accessTokens.create(user, undefined, {
      expiresIn: tokenExpiration ?? '',
    })

    const validated = await LoginResponseValidator.validate({
      token: {
        value: token.toJSON().token,
        expiresAt: token.toJSON().expiresAt?.toISOString(),
      },
      user: { ...user.serialize() },
    })

    return response.ok(validated)
  }

  /**
   * @register
   * @requestBody <RegisterRequestValidator>.append("passwordConfirmation": "xxxxxxxx")
   * @responseBody 200 - <RegisterResponseValidator>
   */
  async register({ request, response }: HttpContext) {
    const payload = await request.validateUsing(RegisterRequestValidator)

    const user = await User.create(payload)
    const validated = await RegisterResponseValidator.validate(user.serialize())

    return response.created(validated)
  }
  /**
   * @getData
   * @requestBody <UserValidator>.append("id": 1, "fullName": "xxxxx", "email": "", "cpf": "xxxxxxxx", "createdAt": "2022-01-01T00:00:00.000Z", "updatedAt": "2022-01-01T00:00:00.000Z")
   * @responseBody 200 - <Dados do usuário autenticado>
   */
  async getData({ auth, response }: HttpContext) {
    try {
      const user = await auth.user
      if (!user) {
        console.log('Usuário não autenticado')
        return response.unauthorized('Usuário não autenticado')
      }

      const validated = await UserValidator.validate(user.serialize())
      return response.ok(validated)
    } catch (error) {
      console.log('Erro ao obter dados do usuário:', error)
      return response.internalServerError('Erro ao obter dados do usuário')
    }
  }
}

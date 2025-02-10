import User from '#models/user'
import {
  LoginRequestValidator,
  LoginResponseValidator,
  RegisterRequestValidator,
  RegisterResponseValidator,
  RequestResetPasswordValidator,
  ResetPasswordValidator,
} from '#validators/auth_validator'
import type { HttpContext } from '@adonisjs/core/http'
import env from '#start/env'
import crypto from 'crypto'
import mail from '@adonisjs/mail/services/main'

import { UserValidator } from '#validators/user_validator'
import { DateTime } from 'luxon'
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
   * @responseBody 200 - <UserValidator>.append("id": 1, "fullName": "xxxxx", "email": "", "cpf": "xxxxxxxx", "createdAt": "2022-01-01T00:00:00.000Z", "updatedAt": "2022-01-01T00:00:00.000Z")
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

  /**
   * @requestPasswordReset
   * @requestBody {"email": "johndoe@gmail.com"}
   * @responseBody 200 - { message: "Cheque seu email para confirmar a solicitação de recuperação." }
   */
  public async requestPasswordReset({ request, response }: HttpContext) {

    const payload = await request.validateUsing(RequestResetPasswordValidator)

    const user = await User.findBy('email', payload.email)

    if (!user) {
      return response.notFound('Usuário não existe')
    }

    const resetToken = crypto.randomBytes(32).toString('hex')

    user.passwordResetToken = resetToken
    user.passwordResetTokenExpiration = DateTime.now().plus({ minutes: 10 })
    await user.save()

    const emailDomain = env.get('SMTP_USERNAME')

    await mail.send((message) => {
      message
        .to(payload.email)
        .from(emailDomain)
        .subject('Solicitação de recuperação de senha - EI VIZINHO!')
        .html(`<p>Oii! está aqui seu token para solicitar a troca da senha: <strong>${resetToken}</strong></p>`)
    })

    return response.ok({ message: 'Cheque seu email para trocar a senha' })
  }

  /**
   * @validateResetToken
   * @paramPath token - Token do request - @type(string) @required
   * @responseBody 200 - { message: "Token válido." }
   * @responseBody 404 - { message: "Token inválido." }
   * @responseBody 400 - { message: "Token expirado." }
   */
  public async validateResetToken({ params, response }: HttpContext) {
    const token = params.token
    const user = await User.findBy('passwordResetToken', token)

    if (!user) {
      return response.notFound({ message: 'Token inválido' })
    }

    const currentTime = new Date().getTime()
    if (user.passwordResetTokenExpiration && currentTime > user.passwordResetTokenExpiration.toMillis()) {
      return response.badRequest({ message: 'Token expirado' })
    }

    return response.ok({ message: 'Token válido' })
  }

  /**
   * @resetPassword
   * @paramPath token - Token do request - @type(string) @required
   * @requestBody { "password": "newPassword123", "passwordConfirmation": "newPassword123" }
   * @responseBody 200 - { message: "Senha alterada com sucesso." }
   * @responseBody 400 - { message: "Senhas não correspondentes." }
   * @responseBody 404 - { message: "Token inválido." }
   * @responseBody 400 - { message: "Token expirado." }
   */
  public async resetPassword({ request, response, params }: HttpContext) {
    const token = params.token
    const payload = await request.validateUsing(ResetPasswordValidator)

    const user = await User.findBy('passwordResetToken', token)

    if (!user) {
      return response.notFound({ message: 'Token inválido' })
    }

    const currentTime = new Date().getTime()
    if (user.passwordResetTokenExpiration && currentTime > user.passwordResetTokenExpiration.toMillis()) {
      return response.badRequest({ message: 'Token expirado' })
    }

    user.password = payload.password
    user.passwordResetToken = null
    user.passwordResetTokenExpiration = null
    await user.save()

    return response.ok({ message: 'Senha alterada com sucesso' })
  }

}
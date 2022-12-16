import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class LoginValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    email: schema.string({}, [
      rules.email(),
      rules.normalizeEmail({
        allLowercase: true,
        gmailRemoveDots: true,
        gmailRemoveSubaddress: true,
      }),
    ]),
    password: schema.string({}, [rules.trim(), rules.escape(), rules.alphaNum()]),
  })

  public messages: CustomMessages = {
    'email.email': 'Formato de e-mail inválido',
    'password.alphaNum': 'Formato de senha inválido!',
  }
}

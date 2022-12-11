import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateUserValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    firstName: schema.string({}, [
      rules.maxLength(32),
      rules.trim(),
      rules.escape(),
      rules.alpha(),
    ]),
    lastName: schema.string({}, [rules.maxLength(32), rules.trim(), rules.escape(), rules.alpha()]),
    email: schema.string({}, [
      rules.email(),
      rules.normalizeEmail({
        allLowercase: true,
        gmailRemoveDots: true,
        gmailRemoveSubaddress: true,
      }),
      rules.unique({ table: 'users', column: 'email' }),
    ]),
    password: schema.string({}, [
      rules.confirmed('passwordConfirmation'),
      rules.alphaNum(),
      rules.minLength(8),
      rules.maxLength(16),
    ]),
  })

  public messages: CustomMessages = {
    'firstName.required': 'Seu nome é obrigatório para o cadastro!',
    'firstName.alpha': 'Seu nome deve conter apenas letras!',
    'firstName.maxLength': 'O tamanho máximo de um nome é de 32 caracteres.',
    'lastName.required': 'Seu sobrenome é obrigatório para o cadastro!',
    'lastName.alpha': 'Seu sobrenome deve conter apenas letras!',
    'lastName.maxLength': 'O tamanho máximo de um sobrenome é de 32 caracteres.',
    'email.required': 'Seu e-mail é obrigatório para o cadastro!',
    'email.unique': 'Endereço de e-mail já cadastrado!',
    'email.email': 'Formato de e-mail inválido!',
    'password.required': 'Sua senha é obrigatório para o cadastro!',
    'passwordConfirmation.confirmed': 'Você inseriu senhas diferentes!',
    'password.alphaNum': 'Sua senha deve conter apenas letras e/ou números',
    'password.maxLength': 'O tamanho máximo de uma senha é de 16 caracteres.',
    'password.minLength': 'O tamanho mínimo de uma senha é de 8 caracteres.',
  }
}

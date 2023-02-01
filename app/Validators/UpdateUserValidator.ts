import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateUserValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    firstName: schema.string.nullable({}, [
      rules.maxLength(32),
      rules.trim(),
      rules.escape(),
      rules.alpha(),
    ]),
    lastName: schema.string.nullable({}, [
      rules.maxLength(32),
      rules.trim(),
      rules.escape(),
      rules.alpha(),
    ]),
    email: schema.string.nullable({}, [
      rules.email(),
      rules.normalizeEmail({
        allLowercase: true,
        gmailRemoveDots: true,
        gmailRemoveSubaddress: true,
      }),
      rules.unique({ table: 'users', column: 'email' }),
    ]),
    password: schema.string.nullable({}, [
      rules.trim(),
      rules.escape(),
      rules.minLength(8),
      rules.maxLength(16),
      rules.alphaNum(),
    ]),
    passwordConfirmation: schema.string({}, [rules.trim(), rules.escape()]),
  })

  public messages: CustomMessages = {
    'firstName.maxLength': 'O tamanho máximo de um nome é de 32 caracteres.',
    'firstName.alpha': 'Seu nome deve conter apenas letras!',
    'lastName.maxLength': 'O tamanho máximo de um sobrenome é de 32 caracteres.',
    'lastName.alpha': 'Seu sobrenome deve conter apenas letras!',
    'email.unique': 'Endereço de e-mail já cadastrado!',
    'email.email': 'Formato de e-mail inválido!',
    'password.maxLength': 'O tamanho máximo de uma senha é de 16 caracteres.',
    'password.minLength': 'O tamanho mínimo de uma senha é de 8 caracteres.',
    'password.alphaNum': 'Sua senha deve conter apenas letras e/ou números',
    'passwordConfirmation.required':
      'É necessário inserir sua senha atual para editar suas informações!',
  }
}

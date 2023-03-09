import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class SearchValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    busca: schema.string.nullable({}, [rules.trim()]),
  })

  public messages: CustomMessages = {}
}

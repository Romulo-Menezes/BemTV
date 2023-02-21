import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class VideoValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    title: schema.string([rules.trim()]),
    description: schema.string.nullable({}, [rules.trim()]),
    url: schema.string([
      rules.trim(),
      rules.regex(
        /^(https:\/\/www\.youtube\.com\/watch\?v=)[^"&?/\s]{11}|(https:\/\/youtu\.be\/)[^"&?/\s]{11}$/
      ),
      rules.maxLength(43),
    ]),
  })

  public messages: CustomMessages = {
    'url.regex': 'Só é aceito links de vídeos do YouTube!',
    'required': 'Você precisa preencher este campo!',
  }
}

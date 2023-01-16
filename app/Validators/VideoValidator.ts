import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class VideoValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    title: schema.string([rules.trim()]),
    description: schema.string([rules.trim()]),
    url: schema.string([
      rules.trim(),
      rules.regex(
        /^(https:\/\/www\.youtube\.com\/watch\?v=)[^"&?/\s]{11}|(https:\/\/youtu\.be\/)[^"&?/\s]{11}$/
      ),
      rules.maxLength(43),
    ]),
    thumb: schema.string([rules.trim(), rules.url()]),
  })

  public messages: CustomMessages = {
    'url.regex': 'Só é aceito links de vídeos do YouTube!',
    'thumb.url': 'Url inválida',
  }
}
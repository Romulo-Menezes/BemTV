import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import User from 'App/Models/User'
import Video from 'App/Models/Video'
import authConfig from 'Config/auth'

export default class VideosController {
  public async index({ view }: HttpContextContract) {
    const limit = 10
    const videos = await Database.from('videos').orderBy('created_at', 'desc').paginate(1, limit)
    console.log(videos)
    return view.render('video/index', { rows: videos.all() })
  }

  public async create({ view }: HttpContextContract) {
    return view.render('video/create')
  }

  public async store({ response, request, auth }: HttpContextContract) {
    const title = request.input('title')
    const description = request.input('description')
    const url = request.input('url')
    const thumb = request.input('thumb')

    try {
      const user = await User.findOrFail(auth.user?.id)
      await user.related('videos').create({
        title,
        description,
        url,
        thumb,
      })
    } catch (error) {
      console.error(error)
      return response.redirect().back()
    }
    return response.redirect().toRoute('index')
  }
}

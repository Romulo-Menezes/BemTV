import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import User from 'App/Models/User'
import Video from 'App/Models/Video'
import VideoValidator from 'App/Validators/VideoValidator'
export default class VideosController {
  public async index({ view, request }: HttpContextContract) {
    const page = request.input('page', 1)
    const limit = 10
    const videos = await Database.from('videos').orderBy('created_at', 'desc').paginate(page, limit)
    const pagination = {
      currentPage: videos.currentPage,
      endPage: videos.currentPage + 9,
      nextPage: videos.currentPage + 1,
      previousPage: videos.currentPage - 1,
    }
    return view.render('video/index', { videos, pagination })
  }

  public async create({ view }: HttpContextContract) {
    return view.render('video/create')
  }

  public async store({ response, request, auth, session }: HttpContextContract) {
    const payload = await request.validate(VideoValidator)
    const { title, description, url } = payload
    let path
    if (url.length > 28) {
      const link = new URL(url)
      path = link.searchParams.get('v')
    } else {
      path = url.slice(-11)
    }
    try {
      const user = await User.findOrFail(auth.user?.id)
      await user.related('videos').create({
        title,
        description,
        url_code: path,
      })
    } catch (error) {
      console.error(error)
      session.flash('error', 'Ocorreu um erro ao tentar enviar o vídeo ao banco.')
      return response.redirect().toRoute('index')
    }
    session.flash('success', 'Vídeo enviado com sucesso!')
    return response.redirect().toRoute('index')
  }

  public async show({ view, request, response }: HttpContextContract) {
    const id = request.param('id')
    try {
      const video = await Video.findOrFail(id)
      const user = await User.findOrFail(video.user_id)
      return view.render('video/show', {
        video,
        creator: `${user.first_name} ${user.last_name}`,
      })
    } catch (error) {
      console.error(error)
      response.redirect().back()
    }
  }
}

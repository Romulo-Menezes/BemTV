import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import Video from 'App/Models/Video'
import VideoValidator from 'App/Validators/VideoValidator'
import HistoriesController from './HistoriesController'
export default class VideosController {
  public async index({ view, request, response, session }: HttpContextContract) {
    const page = request.input('page', 1)
    const limit = 16
    const videos = await Video.query()
      .preload('author')
      .orderBy('created_at', 'desc')
      .paginate(page, limit)
    if (page > videos.lastPage) {
      session.flash('error', 'Você tentou acessar uma página inexistente!')
      return response.redirect().toRoute('index')
    }
    return view.render('video/index', { videos })
  }

  public async create({ view }: HttpContextContract) {
    return view.render('video/create')
  }

  public async store({ auth, response, request, session }: HttpContextContract) {
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
        description: description ?? '',
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

  public async show({ auth, request, response, session, view }: HttpContextContract) {
    const id = request.param('id')
    let userRating
    try {
      const video = await Video.query().preload('author').where('id', id).firstOrFail()
      video.views++
      video.save()
      if (auth.isLoggedIn && auth.user !== undefined) {
        userRating = HistoriesController.show(auth.user.id, id)
      }
      return view.render('video/show', { video, userRating })
    } catch (e) {
      if (e.message === 'E_ROW_NOT_FOUND: Row not found') {
        session.flash('error', 'Vídeo não encontrado!')
      } else {
        session.flash('error', e.message)
      }
      response.redirect().toRoute('index')
    }
  }
}

import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import Video from 'App/Models/Video'
import VideoValidator from 'App/Validators/VideoValidator'
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

  public async show({ view, request, response, session }: HttpContextContract) {
    const id = request.param('id')
    try {
      const video = await Video.query().preload('author').where('id', id).firstOrFail()
      return view.render('video/show', { video })
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

import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Video from 'App/Models/Video'

export default class UserVideosController {
  public async index({ auth, request, response, session, view }: HttpContextContract) {
    const page = request.input('page', 1)
    const limit = 16
    let videos
    if (auth.user !== undefined && auth.isLoggedIn) {
      videos = await Video.query()
        .where('user_id', auth.user.id)
        .preload('author')
        .orderBy('created_at', 'desc')
        .paginate(page, limit)
      if (page > videos.lastPage) {
        session.flash('error', 'Você tentou acessar uma página inexistente!')
        return response.redirect().toRoute('index')
      }
      return view.render('userVideos/index', { videos })
    } else {
      return response.redirect().toRoute('auth/create')
    }
  }
}

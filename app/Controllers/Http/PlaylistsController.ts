import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import History from 'App/Models/History'
import moment from 'moment'

export default class PlaylistsController {
  public async index({ auth, view, request, response, session }: HttpContextContract) {
    const page = request.input('page', 1)
    const slug = request.param('slug')
    console.log(slug)

    const limit = 16
    if (auth.user !== undefined) {
      const histories = await History.query()
        .where('user_id', auth.user.id)
        .andWhere('liked', true)
        .preload('video', (videoQuery) => {
          videoQuery.preload('author')
        })
        .orderBy('updated_at', 'desc')
        .paginate(page, limit)
      if (page > histories.lastPage) {
        session.flash('error', 'Você tentou acessar uma página inexistente!')
        return response.redirect().toRoute('index')
      }
      const videos = histories.map((histories) => histories.video)
      const times: string[] = videos.map((videos) => {
        moment.locale('pt-br')
        return moment(videos.createdAt.toRFC2822()).fromNow()
      })
      return view.render('playlist/index', { histories, videos, times })
    } else {
      return response.redirect().toRoute('auth/create')
    }
  }
}

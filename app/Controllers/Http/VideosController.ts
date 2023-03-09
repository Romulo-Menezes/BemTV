import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Video from 'App/Models/Video'
import moment from 'moment'
import HistoriesController from './HistoriesController'
export default class VideosController {
  public async index({ view, request, response }: HttpContextContract) {
    const page = request.input('page', 1)
    const limit = 16
    const videos = await Video.query()
      .preload('author')
      .orderBy('created_at', 'desc')
      .paginate(page, limit)
    if (page > videos.lastPage) {
      return response.redirect().toRoute('not-found')
    }
    const times: string[] = videos.map((videos) => {
      moment.locale('pt-br')
      return moment(videos.createdAt.toRFC2822()).fromNow()
    })
    return view.render('video/index', { videos, times })
  }

  public async show({ auth, request, response, session, view }: HttpContextContract) {
    const id = request.param('id')
    let userRating = { liked: false, disliked: false }
    try {
      const video = await Video.query().preload('author').where('id', id).firstOrFail()
      video.views++
      video.save()
      if (auth.isLoggedIn && auth.user !== undefined) {
        userRating = await HistoriesController.show(auth.user.id, id)
      }
      moment.locale('pt-br')
      const time = moment(video.createdAt.toRFC2822()).fromNow()
      return view.render('video/show', { video, userRating, time })
    } catch (e) {
      if (e.message === 'E_ROW_NOT_FOUND: Row not found') {
        session.flash('error', 'Vídeo não encontrado!')
      } else {
        session.flash('error', e.message)
      }
      return response.redirect().toRoute('not-found')
    }
  }
}

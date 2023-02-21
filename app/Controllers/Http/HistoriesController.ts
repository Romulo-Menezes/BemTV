import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import History from 'App/Models/History'
import User from 'App/Models/User'

export default class HistoriesController {
  public async index({ auth, view, request, response, session }: HttpContextContract) {
    const page = request.input('page', 1)
    const limit = 16
    if (auth.user !== undefined) {
      const histories = await History.query()
        .where('user_id', auth.user.id)
        .preload('video', (videoQuery) => {
          videoQuery.preload('author')
        })
        .orderBy('created_at', 'desc')
        .paginate(page, limit)
      if (page > histories.lastPage) {
        session.flash('error', 'Você tentou acessar uma página inexistente!')
        return response.redirect().toRoute('index')
      }
      const videos = histories.map((histories) => histories.video)
      return view.render('history/index', { videos, histories })
    } else {
      return response.redirect().toRoute('auth/create')
    }
  }
  public static async create(userId: number, videoId: number) {
    const user = await User.findOrFail(userId)
    await user.related('history').create({
      video_id: videoId,
    })
  }
  public static async show(
    userId: number,
    videoId: number
  ): Promise<{ liked: boolean; disliked: boolean }> {
    const history = await History.query()
      .where('user_id', userId)
      .andWhere('video_id', videoId)
      .first()
    if (history !== null) {
      return { liked: history.liked, disliked: history.disliked }
    } else {
      this.create(userId, videoId)
      return { liked: false, disliked: false }
    }
  }
}

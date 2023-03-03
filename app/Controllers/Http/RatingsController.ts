import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import History from 'App/Models/History'
import Video from 'App/Models/Video'
import moment from 'moment'
import HistoriesController from './HistoriesController'

export default class RatingsController {
  public async index({ auth, view, request, response }: HttpContextContract) {
    const page = request.input('page', 1)
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
        return response.redirect().toRoute('not-found')
      }
      const videos = histories.map((histories) => histories.video)
      const times: string[] = videos.map((videos) => {
        moment.locale('pt-br')
        return moment(videos.createdAt.toRFC2822()).fromNow()
      })
      return view.render('playlist/index', {
        data: histories,
        videos,
        times,
        title: 'Marcados com gostei',
      })
    } else {
      return response.redirect().toRoute('auth/create')
    }
  }

  public async store({ auth, request, response }: HttpContextContract) {
    const id = request.param('id')
    const liked = request.input('liked')
    const disliked = request.input('disliked')
    let isLiked = false
    let isDisliked = false
    let video = await Video.query().where('id', id).first()
    // Verifica se o usuário está logado
    if (auth.user !== undefined && auth.isLoggedIn && video !== null) {
      // Busca histórico do usuário
      let history = await History.query()
        .where('user_id', auth.user.id)
        .andWhere('video_id', id)
        .first()
      // Verifica se histórico existe
      if (history === null) {
        HistoriesController.create(auth.user.id, id)
        history = await History.query()
          .where('user_id', auth.user.id)
          .andWhere('video_id', id)
          .firstOrFail()
      }
      // Modifica avaliação
      if (liked && history.liked) {
        history.liked = isLiked = false
      } else if (liked) {
        history.liked = isLiked = true
        history.disliked = isDisliked = false
      } else if (disliked && history.disliked) {
        history.disliked = isDisliked = false
      } else {
        history.disliked = isDisliked = true
        history.liked = isLiked = false
      }
      // Atualiza histórico e número das avaliações informações
      await history.save()
      video.likes = (
        await History.query().where('video_id', id).andWhere('liked', true).count('* as total')
      )[0].$extras.total
      video.dislikes = (
        await History.query().where('video_id', id).andWhere('disliked', true).count('* as total')
      )[0].$extras.total
      await video?.save()
      // Envia informações para o front
      return response.json({ isLiked, isDisliked, likes: video.likes, dislikes: video.dislikes })
    }
    return response.json({
      isLiked,
      isDisliked,
      likes: video?.likes,
      dislikes: video?.dislikes,
    })
  }
}

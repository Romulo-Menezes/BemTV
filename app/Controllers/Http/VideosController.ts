import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import History from 'App/Models/History'
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
        description: description !== undefined ? description : '',
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
      if (auth.isLoggedIn && auth.user !== undefined) {
        userRating = HistoriesController.getRating(auth.user.id, id)
      }
      const video = await Video.query().preload('author').where('id', id).firstOrFail()
      video.views++
      video.save()
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

  public async like({ auth, request, response }: HttpContextContract) {
    const id = request.param('id')
    let isLiked = false
    if (auth.user !== undefined && auth.isLoggedIn) {
      let history = await History.query()
        .where('user_id', auth.user.id)
        .andWhere('video_id', id)
        .firstOrFail()
      if (history.disliked) {
        history.disliked = false
        history.liked = true
        isLiked = true
      } else {
        history.liked = !history.liked
        isLiked = !history.liked
      }
      history.save()
      let video = await Video.query().where('id', id).firstOrFail()
      video.likes = (
        await History.query().where('video_id', id).andWhere('liked', true).count('* as total')
      )[0].$extras.total
      video.dislikes = (
        await History.query().where('video_id', id).andWhere('disliked', true).count('* as total')
      )[0].$extras.total
      video.save()
      return response.json({ isLiked, likes: video.likes, dislikes: video.dislikes })
    }
  }

  public async dislike({ auth, request, response }: HttpContextContract) {
    const id = request.param('id')
    let isDisliked = false
    if (auth.user !== undefined && auth.isLoggedIn) {
      let history = await History.query()
        .where('user_id', auth.user.id)
        .andWhere('video_id', id)
        .firstOrFail()
      if (history.liked) {
        history.liked = false
        history.disliked = true
        isDisliked = true
      } else {
        history.disliked = !history.disliked
        isDisliked = !history.disliked
      }
      history.save()
      let video = await Video.query().where('id', id).firstOrFail()
      video.likes = (
        await History.query().where('video_id', id).andWhere('liked', true).count('* as total')
      )[0].$extras.total
      video.dislikes = (
        await History.query().where('video_id', id).andWhere('disliked', true).count('* as total')
      )[0].$extras.total
      video.save()
      return response.json({ isDisliked, likes: video.likes, dislikes: video.dislikes })
    }
  }

  public async likeds({ auth, view, request, response, session }: HttpContextContract) {
    const page = request.input('page', 1)
    const limit = 16
    if (auth.user !== undefined) {
      const histories = await History.query()
        .where('user_id', auth.user.id)
        .andWhere('liked', true)
        .preload('video')
        .orderBy('updated_at', 'desc')
        .paginate(page, limit)
      if (page > histories.lastPage) {
        session.flash('error', 'Você tentou acessar uma página inexistente!')
        return response.redirect().toRoute('index')
      }
      const videos = histories.map((histories) => histories.video)
      return view.render('video/likeds', { histories, videos })
    } else {
      return response.redirect().toRoute('auth/create')
    }
  }
}

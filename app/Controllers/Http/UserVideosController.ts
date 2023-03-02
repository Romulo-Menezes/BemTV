import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import Video from 'App/Models/Video'
import Hash from '@ioc:Adonis/Core/Hash'
import VideoValidator from 'App/Validators/VideoValidator'
import History from 'App/Models/History'
import moment from 'moment'

export default class UserVideosController {
  public async index({ auth, request, response, view }: HttpContextContract) {
    const page = request.input('page', 1)
    const limit = 16
    let videos
    if (auth.user !== undefined) {
      videos = await Video.query()
        .where('user_id', auth.user.id)
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
      return view.render('userVideos/index', { videos, times })
    } else {
      return response.redirect().toRoute('auth/create')
    }
  }

  public async create({ view }: HttpContextContract) {
    return view.render('userVideos/create')
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

  public async edit({ auth, request, response, session, view }: HttpContextContract) {
    const id = request.param('id')
    if (auth.user !== undefined) {
      try {
        const video = await Video.query()
          .where('id', id)
          .andWhere('user_id', auth.user.id)
          .preload('author')
          .firstOrFail()
        return view.render('userVideos/edit', { video })
      } catch (error) {
        session.flash('error', 'Não foi possível localizar o seu vídeo!')
        return response.redirect().toRoute('user/videos')
      }
    } else {
      return response.redirect().toRoute('auth/create')
    }
  }

  public async destroy({ auth, request, response, session }: HttpContextContract) {
    const id = request.param('id')
    const password = request.input('password')
    if (auth.user !== undefined) {
      if (await Hash.verify(auth.user.password, password)) {
        try {
          const video = await Video.query()
            .where('id', id)
            .andWhere('user_id', auth.user.id)
            .firstOrFail()
          await History.query().where('video_id', id).delete()
          await video.delete()
          session.flash('success', 'Vídeo deletado!')
          return response.redirect().toRoute('user/videos')
        } catch (error) {
          console.log(error)
          session.flash('error', 'Não foi possível deletar o vídeo!')
          return response.redirect().toRoute('user/videos')
        }
      } else {
        session.flash('errors.password', 'Senha inválida!')
        response.redirect().back()
      }
    } else {
      return response.redirect().toRoute('auth/create')
    }
  }
}

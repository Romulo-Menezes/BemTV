import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Route from '@ioc:Adonis/Core/Route'
import Later from 'App/Models/Later'
import User from 'App/Models/User'
import moment from 'moment'

export default class LatersController {
  public async index({ auth, view, request, response }: HttpContextContract) {
    const page = request.input('page', 1)
    const limit = 16
    if (auth.user !== undefined) {
      const laters = await Later.query()
        .where('user_id', auth.user.id)
        .preload('video', (videoQuery) => {
          videoQuery.preload('author')
        })
        .orderBy('updated_at', 'desc')
        .paginate(page, limit)
      if (page > laters.lastPage) {
        return response.redirect().toRoute('not-found')
      }
      const videos = laters.map((histories) => histories.video)
      const times: string[] = videos.map((videos) => {
        moment.locale('pt-br')
        return moment(videos.createdAt.toRFC2822()).fromNow()
      })
      return view.render('playlist/index', {
        data: laters,
        videos,
        times,
        title: 'Assistir mais tarde',
        path: Route.makeUrl('later/index'),
      })
    } else {
      return response.redirect().toRoute('auth/create')
    }
  }

  public async store({ auth, request, response }: HttpContextContract) {
    const id = request.param('id')
    if (auth.user !== undefined && auth.isLoggedIn) {
      const later = await Later.query()
        .where('user_id', auth.user.id)
        .andWhere('video_id', id)
        .first()
      if (later !== null) {
        await later.delete()
        return response.json({ msg: 'Vídeo removido!' })
      } else {
        const user = await User.findOrFail(auth.user.id)
        await user.related('laters').create({
          video_id: id,
        })
        return response.json({ msg: 'Vídeo adicionado!' })
      }
    }
    return response.json({ msg: 'Você não está logado!' })
  }
}

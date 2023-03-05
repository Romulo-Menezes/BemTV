import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Route from '@ioc:Adonis/Core/Route'
import Video from 'App/Models/Video'
import SearchValidator from 'App/Validators/SearchValidator'
import moment from 'moment'

export default class SearchesController {
  public async index({ view, request, response }: HttpContextContract) {
    const page = request.input('page', 1)
    const payload = await request.validate(SearchValidator)
    const { busca } = payload
    const limit = 16
    if (busca !== null && busca !== undefined) {
      const videos = await Video.query()
        .whereILike('title', '%' + busca + '%')
        .orWhereILike('description', '%' + busca + '%')
        .preload('author')
        .orderBy('created_at')
        .paginate(page, limit)
      if (page > videos.lastPage) {
        return response.redirect().toRoute('not-found')
      }
      const times: string[] = videos.map((videos) => {
        moment.locale('pt-br')
        return moment(videos.createdAt.toRFC2822()).fromNow()
      })
      return view.render('playlist/index', {
        data: videos,
        videos,
        times,
        title: 'Marcados com gostei',
        path: `${Route.makeUrl('search')}?busca=${busca.replace(' ', '+')}&`,
        search: true,
      })
    }
    return response.redirect().toRoute('index')
  }
}

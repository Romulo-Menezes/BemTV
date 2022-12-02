import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Hash from '@ioc:Adonis/Core/Hash'
import User from 'App/Models/User'

export default class AuthController {
  public async create ( { view }: HttpContextContract ) {
    return view.render('auth/create')
  }

  public async store ( { auth, request, response }: HttpContextContract ) {
    const email = request.input('email')
    const password = request.input('password')

    const user = await User
      .query()
      .where('email', email)
      .firstOrFail()

    if (!(await Hash.verify(user.password, password))) {
      return response.redirect().toRoute('auth/create')
    }
    await auth.use('web').login(user)
    response.redirect().toRoute('/')

  }

  public async destroy ( {auth,  response }: HttpContextContract ) {
    await auth.use('web').logout()
    return response.redirect().toRoute('/')
  }

}

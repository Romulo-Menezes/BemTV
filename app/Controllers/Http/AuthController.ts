import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Hash from '@ioc:Adonis/Core/Hash'
import User from 'App/Models/User'

export default class AuthController {
  public async create({ view }: HttpContextContract) {
    return view.render('auth/create')
  }

  public async store({ auth, request, session, response }: HttpContextContract) {
    const email = request.input('email')
    const password = request.input('password')
    const remember = request.input('remember')
    const rememberMe = remember !== undefined ? true : false
    try {
      const user = await User.query().where('email', email).firstOrFail()
      if (!(await Hash.verify(user.password, password))) {
        session.flash('errors', 'Usuário e/ou senha inválido!')
        return response.redirect().back()
      }
      await auth.use('web').login(user, rememberMe)
      session.flash('success', 'Login efetuado com sucesso!')
      return response.redirect().toPath('/')
    } catch (error) {
      session.flash('errors', 'Usuário e/ou senha inválido!')
      return response.redirect().back()
    }
  }

  public async destroy({ auth, response }: HttpContextContract) {
    await auth.use('web').logout()
    return response.redirect().toRoute('/')
  }
}

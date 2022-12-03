import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Hash from '@ioc:Adonis/Core/Hash'
import User from 'App/Models/User'

export default class AuthController {
  public async create ( { view }: HttpContextContract ) {
    return view.render('auth/create')
  }

  public async store ( { auth, request, view }: HttpContextContract ) {
    const email = request.input('email')
    const password = request.input('password')
    const remember = request.input('remember')
    const rememberMe = remember != undefined? true : false

    try{
      const user = await User
      .query()
      .where('email', email)
      .firstOrFail()

      if (!(await Hash.verify(user.password, password))) {
        return view.render('auth/create', { error: true })
      }
      await auth.use('web').login(user, rememberMe)
      return view.render('index', { successLogin: true })
      
    } catch (error) {
      console.log(error)
      return view.render('auth/create', { error: true })
    }
  }

  public async destroy ( {auth,  response }: HttpContextContract ) {
    await auth.use('web').logout()
    return response.redirect().toRoute('/')
  }

}

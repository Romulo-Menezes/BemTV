import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'

export default class UsersController {

  public async create ( { view }: HttpContextContract ) {
    return view.render('sessions/newLogin')
  }

  public async store ( { request, response } ) {
    const email = request.input('email')
    const password = request.input('password')
    const confirmPassword = request.input('confirm_password')

    if (password != confirmPassword){
      response.redirect().toRoute('/cadastro')
    }

    await User.create( {email, password} )

    response.redirect().toRoute('/login')
  }

}

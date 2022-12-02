import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'

export default class UsersController {

  public async create ( { view }: HttpContextContract ) {
    return view.render('user/create')
  }

  public async edit ( { view }: HttpContextContract ) {
    return view.render('user/update')
  }

  public async store ( { request, response } ) {
    const name = request.input('name')
    const lastName = request.input('last_name')
    const email = request.input('email')
    const password = request.input('password')
    const confirmPassword = request.input('confirm_password')

    if (password != confirmPassword){
      response.redirect().toRoute('/cadastro')
    }
    await User.create( {email: email, password: password, first_name: name, last_name: lastName} )

    response.redirect().toRoute('/login')
  }

  public async update ( { auth, request,response }: HttpContextContract ) {
    const firstName = request.input('first_name')
    const lastName = request.input('last_name')
    const email = request.input('email')
    const password = request.input('password')

    const user = await User.findByOrFail('email', auth.user.email)

    user.first_name = firstName != null ? firstName : user.first_name
    user.last_name = lastName != null ? lastName : user.last_name
    user.email = email != null ? email : user.email
    user.password = password != null ? password : user.password

    await user.save()

    response.redirect().toRoute('/editar-perfil')
  }
}

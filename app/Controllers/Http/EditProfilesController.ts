import Hash from '@ioc:Adonis/Core/Hash'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'

export default class EditProfilesController {
  public async create ( { auth, view }: HttpContextContract ) {
        return view.render('sessions/editProfile')
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

import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'

export default class UsersController {

  public async create ( { view }: HttpContextContract ) {
    return view.render('user/create')
  }

  public async store ( { view, request} ) {
    try {
      const name = request.input('name')
      const lastName = request.input('last_name')
      const email = request.input('email')
      const password = request.input('password')
      const confirmPassword = request.input('confirm_password')
      if (
          name == null ||
          lastName == null ||
          email == null ||
          password  == null ||
          confirmPassword == null
        ) {
          return view.render('user/create', { errorNull: true })
      }
      if (password != confirmPassword){
        return view.render('user/create', { errorPassword: true })
      }
      await User.create( {email: email, password: password, first_name: name, last_name: lastName} )
      return view.render('auth/create', { success: true} )

    } catch (error) {
      console.log(error)
      return view.render('user/create', { errorEmail: true })
    }
  }

  public async edit ( { view }: HttpContextContract ) {
    return view.render('user/update')
  }

  public async update ( { auth, request, view }: HttpContextContract ) {
    try {
      const firstName = request.input('name')
      const lastName = request.input('last_name')
      const email = request.input('email')
      const password = request.input('password')
      const user = await User.findByOrFail('email', auth.user.email)

      user.first_name = firstName != null ? firstName : user.first_name
      user.last_name = lastName != null ? lastName : user.last_name
      user.email = email != null ? email : user.email
      user.password = password != null ? password : user.password

      await user.save()
      return view.render('user/update', { success: true })

    } catch (error) {
      console.log(error)
      return view.render('user/update', { errorEmail: true })
    }
  }
}

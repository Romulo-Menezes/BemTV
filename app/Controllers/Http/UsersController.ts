import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import CreateUserValidator from 'App/Validators/CreateUserValidator'

export default class UsersController {
  public async create({ view }: HttpContextContract) {
    return view.render('user/create')
  }

  public async store({ request, session, response }) {
    const payload = await request.validate(CreateUserValidator)
    const { firstName, lastName, email, password } = payload
    await User.create({
      first_name: firstName,
      last_name: lastName,
      email: email,
      password: password,
    })
    session.flash('success', 'Cadastro criado com sucesso!')
    return response.redirect().toRoute('auth/create')
  }

  public async edit({ view }: HttpContextContract) {
    return view.render('user/update')
  }

  public async update({ auth, request, response, view }: HttpContextContract) {
    try {
      const firstName = request.input('name')
      const lastName = request.input('last_name')
      const email = request.input('email')
      const password = request.input('password')
      const user = await User.findByOrFail('email', auth.user?.email)
      user.first_name = firstName !== null ? firstName : user.first_name
      user.last_name = lastName !== null ? lastName : user.last_name
      user.email = email !== null ? email : user.email
      user.password = password !== null ? password : user.password
      await user.save()
      return response.redirect().toRoute('user/edit')
    } catch (error) {
      console.log(error.messages)
      return view.render('user/update', { errorEmail: true })
    }
  }
}

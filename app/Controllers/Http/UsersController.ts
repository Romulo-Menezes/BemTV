import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import Hash from '@ioc:Adonis/Core/Hash'
import CreateUserValidator from 'App/Validators/CreateUserValidator'
import UpdateUserValidator from 'App/Validators/UpdateUserValidator'

export default class UsersController {
  public async create({ view, auth, response }: HttpContextContract) {
    if (auth.isLoggedIn) {
      return response.redirect().back()
    }
    return view.render('user/create')
  }

  public async store({ request, session, response, auth }) {
    if (auth.isLoggedIn) {
      return response.redirect().back()
    }
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

  public async update({ auth, request, session, response }: HttpContextContract) {
    const payload = await request.validate(UpdateUserValidator)
    const { firstName, lastName, email, password, passwordConfirmation } = payload
    if (auth.user !== undefined) {
      if (!(await Hash.verify(auth.user.password, passwordConfirmation))) {
        session.flashAll()
        session.flash('errors.passwordConfirmation', 'Senha incorreta!')
        return response.redirect().back()
      }
    }
    try {
      const user = await User.findByOrFail('email', auth.user?.email)
      user.first_name = firstName ?? user.first_name
      user.last_name = lastName ?? user.last_name
      user.email = email ?? user.email
      user.password = password ?? user.password
      await user.save()
      session.flash('success', 'Informação(ões) atualizada(s) com sucesso!')
      return response.redirect().back()
    } catch (error) {
      console.log(error.messages)
      session.flash('error', 'Ocorreu um erro ao tentar editar.')
      return response.redirect().back()
    }
  }
}

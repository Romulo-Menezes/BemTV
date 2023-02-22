/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer''
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('/historico', 'HistoriesController.index').as('history/index')

  Route.get('/enviar-video', 'VideosController.create').as('video/create')
  Route.post('/enviar-video', 'VideosController.store').as('video/store')

  Route.get('/playlist/:slug', 'PlaylistsController.index')
    .where('slug', /^[a-z0-9_-]+$/)
    .as('playlist/index')

  Route.get('/seus-videos', 'UserVideosController.index').as('user/videos')

  Route.get('/editar-perfil', 'UsersController.edit').as('user/edit')
  Route.post('/editar-perfil', 'UsersController.update').as('user/update')
}).middleware('auth')

Route.get('/', 'VideosController.index').as('index')
Route.get('/assistir/:id', 'VideosController.show')
  .where('id', {
    match: /^[0-9]+$/,
    cast: (id) => Number(id),
  })
  .as('video/show')
Route.post('/assistir/:id/rating', 'RatingsController.store')
  .where('id', {
    match: /^[0-9]+$/,
    cast: (id) => Number(id),
  })
  .as('rating')

Route.get('/login', 'AuthController.create').as('auth/create')
Route.post('/login', 'AuthController.store').as('auth/store')
Route.get('/logout', 'AuthController.destroy').as('auth/destroy')

Route.get('/cadastro', 'UsersController.create').as('user/create')
Route.post('/cadastro', 'UsersController.store').as('user/store')

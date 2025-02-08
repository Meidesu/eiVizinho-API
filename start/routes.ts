/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import swagger from '#config/swagger'
import router from '@adonisjs/core/services/router'
import AutoSwagger from 'adonis-autoswagger'
import { auth, middleware } from './kernel.js'
const EventStreamController = () => import('@adonisjs/transmit/controllers/event_stream_controller')
const SubscribeController = () => import('@adonisjs/transmit/controllers/subscribe_controller')
const UnsubscribeController = () => import('@adonisjs/transmit/controllers/unsubscribe_controller')

router.on('/').redirect('/docs')

router
  .group(() => {
    router.post('/login', '#controllers/auth_controller.login')
    router.post('/signup', '#controllers/auth_controller.register')
  })
  .prefix('/auth')

router.get('/alerts', '#controllers/alerts_controller.getAll')
router.get('/alert_category', '#controllers/alert_categories_controller.getAll')

router
  .group(() => {
    router.post('/alerts', '#controllers/alerts_controller.create')
    router.get('/alerts/:id', '#controllers/alerts_controller.getById')
    router.put('/alerts/:id', '#controllers/alerts_controller.update')
    router.delete('/alerts/:id', '#controllers/alerts_controller.delete')

    router.post('/alert_category', '#controllers/alert_categories_controller.create')
  })
  .use(
    middleware.auth({
      guards: ['api'],
    })
  )

//obter os dados do usuário autenticado
router.get('/user/data', '#controllers/auth_controller.getData').middleware([auth])

router.get('/ruan', '#controllers/ruans_controller.hello')
router.post('/ruan', '#controllers/ruans_controller.postar')

// returns swagger in YAML
router.get('/swagger', async () => {
  return AutoSwagger.default.docs(router.toJSON(), swagger)
})

// Renders Swagger-UI and passes YAML-output of /swagger
router.get('/docs', async () => {
  return AutoSwagger.default.ui('/swagger', swagger)
  // return AutoSwagger.default.scalar("/swagger"); to use Scalar instead
  // return AutoSwagger.default.rapidoc("/swaggder", "view"); to use RapiDoc instead (pass "view" default, or "read" to change the render-style)
})

router.get('/__transmit/events', [EventStreamController])
router.post('/__transmit/subscribe', [SubscribeController])
router.post('/__transmit/unsubscribe', [UnsubscribeController])

router.get('/notifications', '#controllers/notifications_controller.get')

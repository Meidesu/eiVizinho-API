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
import { middleware } from './kernel.js'

router.on('/').redirect('/docs')

router
  .group(() => {
    router.get('/hello', async () => {
      return {
        hello: 'world',
      }
    })
  })
  .use(
    middleware.auth({
      guards: ['api'],
    })
  )

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

router.get('/ruan', '#controllers/ruans_controller.hello')
router.post('/ruan', '#controllers/ruans_controller.postar')

router.get('/alerts_contegory', '#controllers/alert_categories_controller.getAll')
router.post('/alerts_contegory', '#controllers/alert_categories_controller.create')

router.post('/alerts', '#controllers/alerts_controller.create')
router.get('/alerts', '#controllers/alerts_controller.getAll')
router.put('/alerts/:id', '#controllers/alerts_controller.update')

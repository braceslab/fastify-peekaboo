const tap = require('tap')
const fastify = require('fastify')
const got = require('got')

const peekaboo = require('../src/plugin')

tap.test('peekaboo plugin is loaded',
  async (_test) => {
    _test.plan(1)
    const _fastify = fastify()
    await _fastify
      .register(peekaboo)
      .ready()
    await _fastify.close()
    _test.pass(_fastify.peekaboo)
  })

tap.test('peekaboo plugin is working (basic match)',
  async (_test) => {
    _test.plan(1)
    const _fastify = fastify({
      logger: {
        level: 'trace'
      }
    })
    _fastify
      .register(peekaboo, {
        xheader: true,
        matches: [{
          request: {
            methods: 'get',
            route: '/home'
          }
        }]
      })

    _fastify.get('/home', async (request, response) => {
      response.send('hey there')
    })

    try {
      await _fastify.listen(0)
      _fastify.server.unref()
      const _port = _fastify.server.address().port
      const _url = `http://127.0.0.1:${_port}/home`
      await got(_url)
      const _response = await got(_url)
      if (!_response.headers['x-peekaboo']) {
        _test.fail()
      }
      await _fastify.close()
      _test.pass()
    } catch (error) {
      _test.threw(error)
    }
  })

tap.test('peekaboo plugin is working (default settings)',
  async (_test) => {
    _test.plan(1)
    const _fastify = fastify()
    _fastify
      .register(peekaboo, {
        xheader: true,
        matches: [{
          request: {
            route: '/'
          }
        }]
      })

    _fastify.all('/home', async (request, response) => {
      response.send('this is the home')
    })

    try {
      await _fastify.listen(0)
      _fastify.server.unref()
      const _port = _fastify.server.address().port
      const _url = `http://127.0.0.1:${_port}/home`
      await got(_url)
      const _response = await got(_url)
      if (!_response.headers['x-peekaboo']) {
        _test.fail()
      }
      await _fastify.close()
      _test.pass()
    } catch (error) {
      _test.threw(error)
    }
  })

const tap = require('tap')
const fastify = require('fastify')
const helper = require('../helper')

const peekaboo = require('../../src/plugin')

tap.test('peekaboo matching by response status (exact)',
  async (_test) => {
    _test.plan(1)
    const _fastify = fastify()
    _fastify
      .register(peekaboo, {
        xheader: true,
        rules: [{
          request: {
            methods: '*',
            route: true
          },
          response: {
            status: 201
          }
        }]
      })

    _fastify.get('/200', async (request, response) => {
      response.code(200).send('200')
    })

    _fastify.get('/201', async (request, response) => {
      response.header('empty', '')
      response.code(201).send('201')
    })

    try {
      await helper.fastify.start(_fastify)

      let url = helper.fastify.url(_fastify, '/200')
      await helper.request({ url })
      let _response = await helper.request({ url })
      if (_response.headers['x-peekaboo']) {
        _test.fail()
      }

      url = helper.fastify.url(_fastify, '/201')
      await helper.request({ url })
      _response = await helper.request({ url })
      if (!_response.headers['x-peekaboo']) {
        _test.fail()
      }

      await helper.fastify.stop(_fastify)
      _test.pass()
    } catch (error) {
      _test.threw(error)
    }
  })

tap.test('peekaboo matching by response status (regexp)',
  async (_test) => {
    _test.plan(1)
    const _fastify = fastify()
    _fastify
      .register(peekaboo, {
        xheader: true,
        rules: [{
          request: {
            methods: '*',
            route: true
          },
          response: {
            status: /^2/
          }
        }]
      })

    _fastify.get('/200', async (request, response) => {
      response.code(200).send('200')
    })

    _fastify.get('/301', async (request, response) => {
      response.code(301).send('301')
    })

    try {
      await helper.fastify.start(_fastify)

      let url = helper.fastify.url(_fastify, '/200')
      await helper.request({ url })
      let _response = await helper.request({ url })
      if (!_response.headers['x-peekaboo']) {
        _test.fail()
      }

      url = helper.fastify.url(_fastify, '/301')
      await helper.request({ url, throwHttpErrors: false })
      _response = await helper.request({ url, throwHttpErrors: false })
      if (_response.headers['x-peekaboo']) {
        _test.fail()
      }

      await helper.fastify.stop(_fastify)
      _test.pass()
    } catch (error) {
      _test.threw(error)
    }
  })

tap.test('peekaboo matching by response headers (object)',
  async (_test) => {
    _test.plan(1)
    const _fastify = fastify()
    _fastify
      .register(peekaboo, {
        xheader: true,
        rules: [{
          request: {
            methods: '*',
            route: true
          },
          response: {
            headers: {
              'x-test': true
            }
          }
        }]
      })

    _fastify.get('/', async (request, response) => {
      response
        .header('x-test', 'one')
        .send('hello')
    })

    try {
      await helper.fastify.start(_fastify)

      const url = helper.fastify.url(_fastify, '/')
      await helper.request({ url })
      const _response = await helper.request({ url })
      if (!_response.headers['x-peekaboo']) {
        _test.fail()
      }

      await helper.fastify.stop(_fastify)
      _test.pass()
    } catch (error) {
      _test.threw(error)
    }
  })

tap.test('peekaboo matching by response headers (function)',
  async (_test) => {
    _test.plan(1)
    const _fastify = fastify()
    _fastify
      .register(peekaboo, {
        xheader: true,
        rules: [{
          request: {
            methods: '*',
            route: true
          },
          response: {
            headers: function (headers) {
              return !!headers['set-cookie']
            }
          }
        }]
      })

    _fastify.get('/cookie', async (request, response) => {
      response
        .header('set-cookie', 'session=987654abcdeeecafebabe')
        .send('ok')
    })

    _fastify.get('/home', async (request, response) => {
      response.send('home')
    })

    try {
      await helper.fastify.start(_fastify)

      let url = helper.fastify.url(_fastify, '/cookie')
      await helper.request({ url })
      let _response = await helper.request({ url })
      if (!_response.headers['x-peekaboo']) {
        _test.fail()
      }

      url = helper.fastify.url(_fastify, '/home')
      await helper.request({ url })
      _response = await helper.request({ url })
      if (_response.headers['x-peekaboo']) {
        _test.fail()
      }

      await helper.fastify.stop(_fastify)
      _test.pass()
    } catch (error) {
      _test.threw(error)
    }
  })

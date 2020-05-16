const tap = require('tap')
const fastify = require('fastify')
const helper = require('../helper')

const peekaboo = require('../../src/plugin')

tap.test('peekaboo storage (default settings)',
  async (_test) => {
    _test.plan(2)
    const _fastify = fastify()
    _fastify
      .register(peekaboo, {
        xheader: true,
        expire: 30 * 1000
      })

    _fastify.all('/', async (request, response) => {
      response.send('response')
    })

    await helper.fastify.start(_fastify)

    try {
      const url = helper.fastify.url(_fastify, '/')
      await helper.request({ url })
      const _response = await helper.request({ url })
      if (_response.headers['x-peekaboo'] !== 'from-cache-memory') {
        _test.fail('should use cache, but it doesnt')
      }
      _test.equal(_response.body, 'response')
    } catch (error) {
      _test.threw(error)
    }

    await helper.fastify.stop(_fastify)
    _test.pass()
  })

tap.test('peekaboo storage (file)',
  async (_test) => {
    _test.plan(2)
    const _fastify = fastify()
    _fastify
      .register(peekaboo, {
        xheader: true,
        expire: 30 * 1000,
        storage: {
          mode: 'fs',
          config: {
            path: '/tmp/peekaboo'
          }
        }
      })

    _fastify.all('/', async (request, response) => {
      response.send('response')
    })

    await helper.fastify.start(_fastify)

    try {
      const url = helper.fastify.url(_fastify, '/')
      await helper.request({ url })
      const _response = await helper.request({ url })
      if (_response.headers['x-peekaboo'] !== 'from-cache-fs') {
        _test.fail('should use cache fs, but it doesnt')
      }
      _test.equal(_response.body, 'response')
    } catch (error) {
      _test.threw(error)
    }

    await helper.fastify.stop(_fastify)
    _test.pass()
  })

// @todo expiration
// @todo persistence
// @todo info
// @todo list

'use strict'

const fastify = require('fastify')({
  logger: true
})

const schemas = require('./schema-dist');

const schema = {
  schema: {
    response: {
      200: schemas.HellWorldSchema
    }
  }
}

fastify
  .get('/', schema, function (req, reply) {
    reply
      .send({ attr1: 'hello', attr2: 'world', attr3: 'optional' })
  })

fastify.listen(3000, (err, address) => {
  if (err) throw err
  console.log('begin listen: ', address)
})

'use strict'

import fastify, { FastifyInstance, RouteShorthandOptions } from 'fastify';
import { Server, IncomingMessage, ServerResponse } from 'http';

// Create an http server. We pass the relevant typings for our http version used.
// By passing types we get correctly typed access to the underlying http objects in routes.
// If using http2 we'd pass <http2.Http2Server, http2.Http2ServerRequest, http2.Http2ServerResponse>
const server: FastifyInstance<
  Server,
  IncomingMessage,
  ServerResponse
> = fastify({ logger: true });

import * as schemas from './schema-dist';
import type { HellWorld  } from "./schema";

const schema = {
  schema: {
    response: {
      200: schemas.HellWorldSchema
    }
  }
}

server
  .get('/', schema, function (req, reply) {
    let res: HellWorld = {
      attr1: 'hello', 
      attr2: 'world', 
      attr3: 'optional'
    }

    reply
      .send(res);
  })

server.listen(3000, (err, address) => {
  if (err) throw err
  console.log('begin listen: ', address)
})

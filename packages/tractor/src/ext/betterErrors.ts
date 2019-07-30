import * as Hapi from '@hapi/hapi';
import * as Boom from '@hapi/boom';

const server = new Hapi.Server();

export interface IDevErrorPayload extends Boom.Payload {
  data: any;
  stack: any;
}

export interface IDevError extends Boom<any> {
  output: {
    /**
     * statusCode - the HTTP status code (typically 4xx or 5xx).
     */
    statusCode: number;

    /**
     * headers - an object containing any HTTP headers where each key
     * is a header name and value is the header content.
     * (Limited value type to string https://github.com/hapijs/boom/issues/151 )
     */
    headers: {[index: string]: string};

    /**
     * payload - the formatted object used as the response payload (stringified).
     * Can be directly manipulated but any changes will be lost if reformat() is called.
     * Any content allowed and by default includes the following content:
     */
    payload: IDevErrorPayload;
  };
}

export function betterErrors(request: Hapi.Request, reply: Hapi.ResponseToolkit) {  
  if (typeof request.response['isBoom'] !== 'undefined') {
    return reply.continue;
  }

  const err: IDevError = <any> request.response;

  if (err.data) {
    err.output.payload.data = err.data;
  }

  if (500 === err.output.payload.statusCode && process.env.NODE_ENV !== 'production') {
    if (err.message) {
      err.output.payload.message = err.message;
    }

    if (err.stack)
      err.output.payload.stack = err.stack.split('\n').slice(1).map(l => l.replace(/\s*at\s*/, ''));
  }

  return reply.response(err);
}

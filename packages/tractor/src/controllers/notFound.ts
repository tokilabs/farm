import * as Hapi from 'hapi';
import * as Boom from 'boom';

import { Controller } from '../decorators';
import { IController } from '../interfaces';
import { Endpoint } from '../decorators';

/**
 * Catch-all controller
 *
 * This controller's route `notFound` will catch any request for
 * routes that are not matched by any existing controller
 *
 * @export
 * @class NotFoundCtrl
 * @implements {IController}
 */
@Controller
export class NotFoundCtrl implements IController {

  @Endpoint(
    'GET', '/{any*}',
    {
      description: 'Matchs any url to log 404 requests',
      tags: ['api']
  })
  public notFound(req: Hapi.Request, reply: Hapi.ReplyNoContinue) {
    let accept = req.raw.req.headers.accept;

    accept = (Array.isArray(accept) ? accept.join() : accept);

    if (accept && accept.match(/json/)) {
      const err = Boom.notFound('Endpoint not found', { url: req.url });
      (<any>err.output.payload).data = err.data;

      return reply(err);
    }

    reply().code(404);
  }
}

import { Server } from 'hapi';
import { inject, multiInject } from 'inversify';

import { IController } from './interfaces';
import { EndpointMetadata, EndpointMetadataKey } from './decorators/endpoint';
import { injectable } from 'inversify';

const debug = require('debug')('tractor');

export const IRouter = Symbol.for('@cashfarm/tractor.IRouter');

export interface IRouter {
  addControllers(ctrls: IController[]): void;
  addController(ctrl: IController): void;
}

@injectable()
export class Router implements IRouter {
  @inject('ApiPrefix')
  public prefix = '';

  private controllers: IController[];

  constructor(
    @inject(Server) private server: Server,
    @multiInject(IController) controllers: IController[]) {
      this.controllers = [];

      if (Array.isArray(controllers) && controllers.length)
        this.addControllers(controllers);
  }

  /**
   * Registers endpoints for the current controllers
   *
   * @memberof Router
   */
  public addControllers(ctrls: IController[]): void {
    if (!Array.isArray(ctrls))
      throw new Error(`Router.addControllers() expects an array of IController objects, but received ${JSON.stringify(ctrls)}`);

    this.controllers = this.controllers.concat(this.controllers, ctrls);

    ctrls.forEach(c => this.addController(c));
  }

  public addController(ctrl: IController): void {
    debug(`Adding controller ${ctrl.constructor.name}`);

    const edpts: { [k: string]: EndpointMetadata } = Reflect.getMetadata(EndpointMetadataKey, ctrl.constructor);

    Reflect.ownKeys(edpts).forEach(epName => {
      this.registerEndpoint(ctrl, epName, edpts[String(epName)]);
    });
  }

  private registerEndpoint(ctrl: IController, methodKey: PropertyKey, meta: EndpointMetadata) {
    const path = (this.prefix + meta.path).trim().length === 0 ? '/' : (this.prefix + meta.path);

    this.server.log('debug', `Mapping route ${path} to ${ctrl.constructor.name}.${String(methodKey)}`);

    this.server.route(
      {
        method: meta.method,
        path: path,
        config: {
          description: meta.description,
          notes: meta.notes,
          tags: meta.tags,
          handler: ctrl[methodKey].bind(ctrl),
          validate: meta.validate
        }
      }
    );
  }
}

export default Router;

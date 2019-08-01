import { Server } from '@hapi/hapi';
import { inject, multiInject } from 'inversify';

import { EndpointMetadata, EndpointMetadataKey } from './decorators/endpoint';
import { injectable } from 'inversify';
import { ConcreteType } from '@cashfarm/lang';
import { Controllers } from './decorators';

const debug = require('debug')('tractor');

export const IRouter = Symbol.for('@cashfarm/tractor.IRouter');

export interface IRouter {
  addControllers(ctrls: ConcreteType[]): void;
  addController(ctrl: ConcreteType): void;
}

@injectable()
export class Router implements IRouter {
  @inject('ApiPrefix')
  public prefix = '';

  private controllers: ConcreteType[];

  constructor(
    @inject(Server) private server: Server,
    @multiInject(Controllers) controllers: ConcreteType[]) {
      this.controllers = [];

      if (Array.isArray(controllers) && controllers.length)
        this.addControllers(controllers);
  }

  /**
   * Registers endpoints for the current controllers
   *
   * @memberof Router
   */
  public addControllers(ctrls: ConcreteType[]): void {
    if (!Array.isArray(ctrls))
      throw new Error(`Router.addControllers() expects an array of classes, but received ${JSON.stringify(ctrls)}`);

    this.controllers = this.controllers.concat(this.controllers, ctrls);

    ctrls.forEach(c => this.addController(c));
  }

  public addController(ctrl: ConcreteType): void {
    debug(`Adding controller ${ctrl.constructor.name}`);

    const edpts: { [k: string]: EndpointMetadata } = Reflect.getMetadata(EndpointMetadataKey, ctrl.constructor);

    Reflect.ownKeys(edpts).forEach(epName => {
      this.registerEndpoint(ctrl, epName, edpts[String(epName)]);
    });
  }

  private registerEndpoint(ctrl: ConcreteType, methodKey: PropertyKey, meta: EndpointMetadata) {
    const path = (this.prefix + meta.path).trim().length === 0 ? '/' : (this.prefix + meta.path);

    this.server.log('debug', `Mapping route ${path} to ${ctrl.constructor.name}.${String(methodKey)}`);

    this.server.route(
      {      
        method: meta.method,
        path: path,
        options: {
          description: meta.description,
          notes: meta.notes,
          tags: meta.tags,
          handler: ctrl[methodKey].bind(ctrl),
          validate: meta.validate,
          auth: meta.auth
        }
      }
    );
  }
}

export default Router;

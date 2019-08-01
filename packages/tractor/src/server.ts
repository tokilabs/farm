// tslint:disable:no-console
// tslint:disable:no-import-side-effect
import 'reflect-metadata';
import { betterErrors } from './ext/betterErrors';
import { Server } from '@hapi/hapi';
import * as Glue from '@hapi/glue';

import Config from './config';
import { interfaces as IoC, decorate, inject, injectable, multiInject } from 'inversify';

import './router';

import { container as plowContainer, Container } from '@cashfarm/plow';
import { Router } from './router';
import { ITractorConfig } from './iTractorConfig';
import { setupContainer } from './container.config';
import { Controllers } from './decorators';
import { listContainerBindings } from './util';
import { ConcreteType } from '@cashfarm/lang';

const debug = require('debug')('tractor');

const composeOptions = {
  relativeTo: __dirname
};

export interface ITractorServer extends Server {
  getContainer(): Container;
  getRouter(): Router;
}

// tslint:disable-next-line:max-line-length
export async function createServer(serviceName: string, options?: ITractorConfig, customContainer?: Container): Promise<ITractorServer>;
export async function createServer(
                        serviceName: string, override?: (server: Server) => void, customContainer?: Container): Promise<ITractorServer>;
export async function createServer(
          serviceName: string,
          override?: ITractorConfig|((server: ITractorServer) => void),
          customContainer?: Container):
              Promise<Server> {
  
    const container = customContainer || plowContainer;

    const options: ITractorConfig = {
      debug: process.env.NODE_ENV !== 'production',
      enableCors: true,
      port: 3210
    };

    if (typeof override === 'object') {
      Object.assign(options, override);
    }

    const criteria = Object.assign({
      env: process.env.NODE_ENV || 'development',
      cors: options.enableCors ? 'on' : 'off'
    }, options);

    const manifest = Config.get('/', criteria) as Glue.Manifest;

    return Glue.compose(manifest, composeOptions)
      .then((server?: ITractorServer) => {
        setupContainer(container, serviceName, server, options);
        server.decorate('server', 'getContainer', () => container);

        if (options.debug) {
          server.settings.debug = { log: ['error', 'uncaught'], request: ['error', 'uncaught'] };
          server.ext('onPreResponse', betterErrors);
        }

        if (typeof override === 'function') {
          override(server);
        }

        server.events.on('start', () => {
          const ctrls = container.getAll<ConcreteType>(Controllers);
          debug('Controllers:', ctrls);
          server.getRouter().addControllers(ctrls);

          debug(`Container (${container.guid}) bindings so far`);
          listContainerBindings(container).map( (b: string, i: number) => debug(i, b));
        });

        return server;
      });
}

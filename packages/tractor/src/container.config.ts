// tslint:disable-next-line:no-import-side-effect
import 'reflect-metadata';

import { Server } from 'hapi';

import { Container } from '@cashfarm/plow';

import { Router, IRouter } from './router';
import { ITractorConfig } from './iTractorConfig';
import { listContainerBindings } from './util';

const debug = require('debug')('tractor:ioc');

export function setupContainer(container: Container, serviceName: string, server: Server, options: ITractorConfig) {
  require('./controllers');

  const router = new Router(server, []);
  server.decorate('server', 'getRouter', () => router);
  container.bind<IRouter>(IRouter).toConstantValue(router);

  container.bind(Server).toConstantValue(server);
  container.bind('ApiPrefix').toConstantValue(options.apiPrefix);

  debug(`Container (${container.id}) bindings so far`);
  listContainerBindings(container).map( (b: string, i: number) => debug(i, b));
}

// import { decorate } from 'inversify';
import { provide } from '@cashfarm/plow';

import { ConcreteType, Exception } from '@cashfarm/lang';
import { container } from '@cashfarm/plow';

export const Controllers = Symbol.for('tokilabs.tractor.controllers');

// const provide = makeProvideDecorator(<any>container);
const debug = require('debug')('tractor:ioc');

export function Controller(target: ConcreteType<any>) {
  try {
    debug(`Providing ${target.name} controller`);

    return provide(Controllers)(target);
  }
  catch (e) {
    throw new Exception(`Error decorating controller ${target.name}: ${e.message}`);
  }
}

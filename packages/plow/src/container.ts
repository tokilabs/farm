import { Container } from 'inversify';
import { interfaces as Inversify } from 'inversify/dts/interfaces/interfaces';

import { buildProviderModule, provide as realProvide, fluentProvide as realFluentProvide } from 'inversify-binding-decorators';
import IBD from 'inversify-binding-decorators/dts/interfaces/interfaces';

// Import classes here so they can register themselves
// tslint:disable:no-import-side-effect

const debug = require('debug')('plow:ioc');

const _container = new Container();
_container.load(buildProviderModule())

//
// Make provide and FluentProvide decorators
//
const _provide = (serviceIdentifier: Inversify.ServiceIdentifier<any>, force?: boolean) => (target: any) => {
  debug('Providing:', typeof target === 'function' ? target.name : target, `(${_container.id})\n\t\tin`, module.parent.filename);

  return realProvide(serviceIdentifier, force)(target);
};

const _fluentProvide = (serviceIdentifier: Inversify.ServiceIdentifier<any>): IBD.ProvideInWhenOnSyntax<any> => {
  debug('Fluently Providing:', typeof serviceIdentifier === 'function' ? serviceIdentifier.name : serviceIdentifier, `(${_container.id})\n\t\tin`, module.parent.filename);

  return realFluentProvide(serviceIdentifier);
}

//
// create a unique, global symbol name
// -----------------------------------

const PROVIDE = Symbol.for('tokilabs.plow.provide');
const FLUENT_PROVIDE = Symbol.for('tokilabs.plow.fluentProvide');
const CONTAINER = Symbol.for('tokilabs.plow.container');

// check if the global object has this symbol
// add it if it does not have the symbol, yet
// ------------------------------------------

const globalSymbols = Object.getOwnPropertySymbols(global);

if (!(globalSymbols.indexOf(CONTAINER) > -1)) {
  global[PROVIDE] = _provide;
  global[FLUENT_PROVIDE] = _fluentProvide;
  global[CONTAINER] = _container;
}

// define the singleton API
// ------------------------

const singleton: {
  container: Container;
  provide(target: any): any;
  fluentProvide(target: any): any;
} = <any> {};

Object.defineProperty(singleton, 'provide', {
  get: () => {
    return global[PROVIDE];
  }
});

Object.defineProperty(singleton, 'fluentProvide', {
  get: () => {
    return global[FLUENT_PROVIDE];
  }
});

Object.defineProperty(singleton, 'container', {
  get: () => {
    return global[CONTAINER];
  }
});

// ensure the API is never changed
// -------------------------------

Object.freeze(singleton);

// export the singleton API only
// -----------------------------

export const {
  container,
  provide,
  fluentProvide
} = singleton;

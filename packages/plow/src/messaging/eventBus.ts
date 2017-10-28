const bus = require('servicebus').bus();

import { Type } from '@cashfarm/lang';
import { Handle, IEventPublisher, ISubscribeTo, DomainEvent } from '../domain';
import { Symbols } from '../symbols';

const debug = require('debug')('plow:events');

bus.use(bus.package());
bus.use(bus.correlate());
bus.use(bus.logger());

export const IEventBus = Symbol('IEventBus');
export interface IEventBus {
  register<T extends DomainEvent & Type>(evt: T, handler: any): void;
}

export class EventBus implements IEventBus, IEventPublisher {
  constructor(private serviceName: string) {
    // subscribe this instance to ALL events
    // this way the local microservice can choose
    // to listen to any event
    // bus.subscribe('#', (message: any) => this.fanout(event));
  }

  public subscribe(topic: string, handler: (type: string, evt: DomainEvent) => void) {
    debug(`Registering handler for ${topic}:`, handler.constructor ?
    handler.constructor.name : handler.toString());

    bus.subscribe(topic, (message: any) => handler(message.type, message.data));
  }

  public register<T extends DomainEvent & Type>(evtClass: T, handler: any) {
    const evtName = evtClass.name;
    debug(`Registering handler for ${evtName}:`, handler.constructor ?
        handler.constructor.name : handler.toString());

    bus.subscribe(
      `${this.serviceName}.${evtName}`,
      (name: string, event: DomainEvent) => handler[Handle(evtClass)].apply(handler, [event]));
  }

  public publish(evt: DomainEvent) {
    const evtName = this.getEventName(evt);
    debug(`Publishing event ${evtName}`);

    bus.publish(`${this.serviceName}.${evtName}`, evt);
  }

  private getEventName(evt: DomainEvent) {
    return evt[Symbols.EventName] || evt.constructor[Symbols.EventName] || evt.constructor.name;
  }
}

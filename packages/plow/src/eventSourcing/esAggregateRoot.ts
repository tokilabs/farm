import { Guid, ConcreteType, requireByFQN, Type } from '@cashfarm/lang';
import { Exclude, plainToClass } from 'class-transformer';

import { AggregateRoot, IAggregateRoot, Identity, IDomainEvent } from '../domain';
import { EventEnvelope } from './eventEnvelope';
import { Symbols } from '../symbols';
import { PlowConfig } from '../config';

const APPLY_CHANGE = Symbol('@cashfarm/plow:ESAggregate.APPLY_CHANGE');
const LOAD_FROM_EVENTS = Symbol('@cashfarm/plow:ESAggregate.LOAD_FROM_EVENTS');

export interface IESAggregateRoot<TId extends Identity<any> | Guid> extends IAggregateRoot<TId> {
  readonly version: number;
  readonly uncommittedChanges: IDomainEvent[];
  markChangesAsCommitted(): void;
}

/**
 * Returns a symbol used to created methods that apply events to agrregates
 *
 * @export
 * @param {(DomainEvent & Type)} e
 * @returns {symbol}
 */
export function Apply(e: IDomainEvent & Type): symbol {
  return Symbol.for(e.prototype.constructor.name);
}

/**
 * Base implementation for an event sourced aggregate root.
 *
 * Extend this class and implement `[Apply(EvtClass)]()` methods for
 * each event of your aggregate.
 */
export class ESAggregateRoot<TId extends Identity<any> | Guid> extends AggregateRoot<TId> {
  @Exclude()
  private _version: number = -1;

  public static load<T extends ESAggregateRoot<any>>(constructor: ConcreteType<T>, events: EventEnvelope[]): T {
    const t = Object.create(constructor.prototype);

    t._version = -1;
    t._events = [];

    const mappedEvts = events.map(ee => {
      // Get the event class
      const klass = requireByFQN(ee.eventType);

      // deserialize to a class instance
      return plainToClass(klass, ee.event);
    });

    t[LOAD_FROM_EVENTS](mappedEvts);

    return t;
  }

  get version(): number{
    return this._version;
  }

  get uncommittedChanges(): IDomainEvent[]{
    return this._events;
  }

  public markChangesAsCommitted() {
    this._version += this._events.length;
    this._events.length = 0;
  }

  protected applyChange(event: IDomainEvent) {
    this[APPLY_CHANGE](event, true);
  }

  /**
   * Hidden method to load an aggregate from it's events
   *
   * @private
   * @param {IDomainEvent[]} history The list of events to load
   * @memberof ESAggregateRoot
   */
  private [LOAD_FROM_EVENTS](history: IDomainEvent[]) {
    this._version = history.length - 1;
    history.forEach( event => this[APPLY_CHANGE](event, false));
  }

  /**
   * Hidden method to apply an event
   *
   * @private
   * @param {IDomainEvent} event The event to be applied
   * @param {boolean} isNew Wheter the event is new or not
   * @memberof ESAggregateRoot
   */
  private [APPLY_CHANGE](event: IDomainEvent, isNew: boolean) {
    const evtName = Reflect.getMetadata(Symbols.EventName, event.constructor) || event.constructor.name;

    // Find out the method to apply the function to
    let applyEvent: string | symbol = `apply${evtName}`;

    if (!this[applyEvent]) {
      const constructor = Object.getPrototypeOf(event) ? Object.getPrototypeOf(event).constructor : null;

      if (constructor && this[Apply(constructor)] instanceof Function)
        applyEvent = Apply(constructor);
    }

    if (this[applyEvent] instanceof Function) {
      this[applyEvent](event);
    }
    else {
      if (PlowConfig.requireApplyForEachEvent) {
        const actualImpl = this[applyEvent] instanceof Function ?
          `The aggregate ${this.constructor.name} property [Apply(${evtName})] is a ${typeof this[applyEvent]}` :
          `The Aggregate ${this.constructor.name} has no apply method for ${evtName}`;

        throw new Error(
          `For each event, an aggregate MUST implement an apply method called either apply${evtName}
          or using a symbol generated by the Apply function, e.g. protected [Apply(${evtName})](evt: ${evtName}): void {}.

          ${actualImpl}`);
      }

      PlowConfig.defaultApplyFn(this, event);
    }

    if (isNew)
      this._events.push(event);
  }
}

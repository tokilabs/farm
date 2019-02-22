import * as Hapi from 'hapi';
import * as Joi from 'joi';
import { ConcreteType } from '@cashfarm/lang';

const debug = require('debug')('tractor:ioc');

export const EndpointMetadataKey = Symbol.for('tractor:controller:endpoints');

export type EPMethods = Hapi.HTTP_METHODS_PARTIAL | '*';

/**
 * Defines possible options for the `@Endpoint` decorator
 */
export interface IEndpointOptions {
  /**
   * An optional domain string or an array of domain strings for limiting the route to only
   * requests with a matching host header field. Matching is done against the hostname part
   * of the header only (excluding the port). Defaults to all hosts.
   */
  vhost?: string;
  description?: string;
  notes?: string;
  tags?: string[];
  handler?: string | ( (req: any, reply: any) => any);
  validate?: { query?: any; params?: any; payload?: any; };
  response?: { schema: any; };
}

/**
 * The endpoint metadata class
 *
 * When an endpoint is declared in Tractor using the `@Endpoint` decorator,
 * an instance of EndpointMetadata will be created to hold the metadata
 * and stored using `Reflect.defineMetada` in an array of endpoints referenced
 * by the metadata key `'tractor:controller:endpoint'`.
 */
export class EndpointMetadata implements IEndpointOptions {

  /**
   * the HTTP method. Typically one of 'GET', 'POST', 'PUT', 'PATCH', 'DELETE', or 'OPTIONS'.
   *
   * Any HTTP method is allowed, except for 'HEAD'. Use '*' to match against any HTTP method
   * (only when an exact match was not found, and any match with a specific method will be given
   * a higher priority over a wildcard match). Can be assigned an array of methods which has the
   * same result as adding the same route with different methods manually.
   */
  public method: Hapi.HTTP_METHODS_PARTIAL | '*' | (Hapi.HTTP_METHODS_PARTIAL | '*')[];

  /**
   * the absolute path used to match incoming requests (must begin with '/').
   * Incoming requests are compared to the configured paths based on the connection
   * router configuration option. The path can include named parameters enclosed in {}
   * which will be matched against literal values in the request as described in Path parameters.
   */
  public path: string;

  /**
   * an optional domain string or an array of domain strings for limiting the route to only
   * requests with a matching host header field. Matching is done against the hostname part
   * of the header only (excluding the port). Defaults to all hosts.
   */
  public vhost?: string;
  public description: string;
  public notes: string;
  public tags: string[];
  public validate: { query?: any; params?: any; payload?: any; };
  public response: { schema: any };

  constructor(
      method: Hapi.HTTP_METHODS_PARTIAL | '*' | (Hapi.HTTP_METHODS_PARTIAL | '*')[],
      path: string,
      {vhost, description, notes, tags, validate, response}: IEndpointOptions = {}) {
    this.method = method;
    this.path = path;
    this.description = description;
    this.notes = notes;
    this.tags = tags;
    this.validate = validate;
    this.response = response;
    this.vhost = vhost;
  }
}

/**
 * The `@Endpoint` decorator
 *
 * Marks a controller method as an API endpoint
 *
 * @param method The http methods this endpoint will respond to
 * @param path The endpoint's path
 * @param options Hapi endpoint options
 */
export function Endpoint(method: EPMethods | EPMethods[], path: string, options: IEndpointOptions): MethodDecorator {
  const metadata = new EndpointMetadata(method, path, options);

  // when called via `new Endpoint()` or `Endpoint()` just return the decorator instance
  // tslint:disable-next-line:no-invalid-this
  if (this instanceof Endpoint) {
    return <any>metadata;
  }

  return <T>(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>): void => {
    const klass = target.constructor === Function ? target : target.constructor;

    const meta = Reflect.getOwnMetadata(EndpointMetadataKey, klass) || {};
    meta[propertyKey] = metadata;
    debug(`Registering endpoint ${metadata.method} ${metadata.path ? metadata.path : "''"} to ${target.constructor.name}.${String(propertyKey)}`);
    Reflect.defineMetadata(EndpointMetadataKey, meta, target.constructor);
  };
}

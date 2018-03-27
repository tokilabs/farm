export interface ITractorConfig {
  /**
   * Defines where logs and errors should contain debug information or not
   *
   * @type {boolean} Default: `true` in development, `false` in production
   * @memberof IMicroserviceOptions
   */
  debug?: boolean;

  /**
   * Whether to enable cors or not
   *
   * @type {boolean} Default `true`
   * @memberof IMicroserviceOptions
   */
  enableCors?: boolean;

  /**
   * The port to listen to
   *
   * @type {number} Default `3000`
   * @memberof IMicroserviceOptions
   */
  port?: number;

  /**
   * An optional prefix to all endpoints
   *
   * @type {string} Default ''
   * @memberof IMicroserviceOptions
   */
  apiPrefix?: string;

  /**
   * Whether or not to decorate plow framework classes to be used
   * with the Inversify container
   *
   * @type {boolean} Default `true`
   * @memberof IMicroserviceOptions
   */
  decoratePlowModules?: boolean;

  /**
   * CQRS and messaging options
   */
  messaging?: {
    /**
     * Wether to enable messaging infrastructure or not
     * @type {boolean} Default `false`
     */
    enabled?: boolean;

    /**
     * Which broker to use for message transport
     *
     * @type {('rabbitmq' | 'pubsub')}
     */
    transport?: 'rabbitmq' | 'pubsub';
  };
}

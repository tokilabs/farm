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
}

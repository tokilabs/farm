import * as Confidence from 'confidence';
import * as Glue from '@hapi/glue';

const manifest /*: Glue.Manifest*/ = {
  $meta: 'This file defines the microservice.',
  server: {
    port: { $param: 'port' },
    debug: {
      $filter: 'debug',
      $default: { log: ['debug', 'error', 'uncaught'], request: ['debug', 'error', 'uncaught'] },
      off: { log: false, request: false }
    },

    router: {
      isCaseSensitive: false,
      stripTrailingSlash: true
    },
    routes: {
      cors: {
        $filter: 'cors',
        'on': {
          origin: ['*']
        },
        'off': false
      }
    }
  },
  register: {
    plugins: {
      $filter: 'env',
      $default: [
        { plugin: '@hapi/inert' },
        { plugin: '@hapi/vision' },
        { plugin: 'blipp' },
        {
          plugin: '@hapi/good',
          options: {
            ops: {
                interval: 1000
            },
            reporters: {
                console: [
                    {
                        module: '@hapi/good-squeeze',
                        name: 'Squeeze',
                        args: [
                            {
                                // log: '*',
                                error: '*',
                                response: '*'
                                // ops: '*'
                            }
                        ]
                    },
                    {
                        module: '@hapi/good-console',
                        args: [
                            {
                                log: '*',
                                error: '*',
                                response: '*',
                                ops: '*'
                            }
                        ]
                    },
                    'stdout'
                ]
            }
          }
        },
        {
          plugin: 'hapi-swagger',
          options: {
            // title: 'Doare Payments API Documentation',
            basePath: '/',
            // version: Config.get('api.version')
            info: {
              title: 'Tractor Generated API Documentation',
              description: 'This doc is given to you by Tractor.'
              // version: Pack.version,
              // termsOfService: 'https://github.com/glennjones/hapi-swagger/',
              // contact: {
              //     email: 'glennjonesnet@gmail.com'
              // },
              // license: {
              //     name: 'MIT',
              //     url:
              //         'https://raw.githubusercontent.com/glennjones/hapi-swagger/master/license.txt'
              // }
            }
          }
        }
      ],
      production: [
        { plugin: 'blipp' }
        // production plugins here
      ]
    }
  }
};

export const Config = new Confidence.Store(manifest);

export default Config;

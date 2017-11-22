import * as Confidence from 'confidence';

const goodOptions = {
  ops: {
      interval: 1000
  },
  reporters: {
      console: [
          {
              module: 'good-squeeze',
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
              module: 'good-console',
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
};

const manifest: any = {
  $meta: 'This file defines the microservice.',
  connections: [{
    labels: [ 'http', 'api' ],
    port: 3000
  }],
  registrations: {
    $filter: 'env',
    $default: [
      { plugin: 'inert' },
      { plugin: 'vision' },
      { plugin: 'blipp' },
      {
        plugin: 'tv'
        // options: {
        //   endpoint: 'tv'
        // }
      },
      {
        plugin: {
          register: 'good',
          options: goodOptions
        }
      },
      {
        plugin: {
          register: 'hapi-swagger',
          options: {
            // title: 'Doare Payments API Documentation',
            basePath: '/',
            // version: Config.get('api.version')
            info: {
              title: 'Test API Documentation',
              description: 'This is a sample example of API documentation.'
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
      }
    ],
    production: [
      { plugin: 'blipp' }
      // production plugins here
    ]
  },
  server: {
    debug: {
      $filter: 'debug',
      $default: { log: ['debug', 'error', 'uncaught'], request: ['debug', 'error', 'uncaught'] },
      off: { log: false, request: false }
    },
    connections: {
        router: {
          isCaseSensitive: false,
          stripTrailingSlash: true
        },
        routes: {
          cors: {
            origin: ['*']
          }
        }
    }
  }
};

export const Config = new Confidence.Store(manifest);

export default Config;

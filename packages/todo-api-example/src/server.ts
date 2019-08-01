// tslint:disable:no-console
// tslint:disable:no-import-side-effect
import 'source-map-support/register';

import { createServer, ITractorServer } from '@tokilabs/tractor';

export const ServiceName = 'TodoService';

// If your are using @Controller decorator, just require your controllers
require('./todoCtrl');

export const server = createServer(
  // Service name
  ServiceName,
  // Options
  {
    apiPrefix: '/todos/v1',
    port: 8000
  }
)
.then(srv => {
  // if running directly, start the server
  if (!module.parent) {
    srv.start()
      .then(() => {
        console.log(`✅ Started ${ServiceName} microservice on ${srv.info.uri}`);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  // if importing, return the server (used for testing)
  return srv;
});

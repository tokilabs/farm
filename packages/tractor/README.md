Tractor
========

A [Hapi](http://hapijs.com) server with superpowers

## Why?

When building apps using microservices it's important that they have the same structure and their setup is as close as possible to each other.
Tractor packs the tools that are used in all of our microservices and comes with sensible defaults for both development and production environments.
It's configuration is accessible from outside so you can tailor it to your specific needs.

By the way, don't worry. Every feature is optional.

## What's on the package

- Dependency injection using an [Inversify Container](https://github.com/inversify/InversifyJS) from [Plow](https://github.com/cashfarm/plow)
- A catch-all controller for 404 responses and logging
- A meta controller that lists your API routes
- Exception classes for normalizing error responses
- Response classes for common scenarios: AckResponse, CreatedResponse and NotFound
- `@Controller` and `@Endpoint` decorators for Hapi routing
- `Request` class you can extend to automatically deserialize the request

## Versions

Tractor's minor version now matches the hapi major version, beginning with Hapi 18. Anything lower than that is for Hapi 16.x.

We do not support Hapi 17 (simply because we never used it, feel free to submit a PR)

## Simple Usage

```typescript
import { createServer } from '@cashfarm/tractor';

export const ServiceName = 'TodoService';

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
  // If your are using @Controller decorator, just require your controllers
  require('./todoCtrl');

  // if running directly, start the server
  if (!module.parent) {
    srv.start(() => {
      console.log(`✅ Started ${ServiceName} microservice on ${srv.info.uri}`);
    });
  }

  // if importing, return the server (used for testing)
  return srv;
});
```

## Configuration Options

### debug
> **@type** `boolean`
> **default:** `true` in development, `false` in production

Defines where logs and errors should contain debug information or not

### enableCors
> **@type** `boolean`
> **default:** `true`

Whether to enable CORS or not

### port
> **@type** `boolean`
> **default:** `3000`

The port to listen to

### apiPrefix
> **@type** `number`
> **default:** `''`

An optional prefix to all endpoints

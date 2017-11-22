import { isFunction, isJsobject } from '@cashfarm/lang';
import { Container } from '@cashfarm/plow';

export function listContainerBindings(container: Container) {
  let replacerCache: any[] = [];
  const replacer = (key: string, value: any) => {
    if (typeof value === 'object' && value !== null) {
        if (replacerCache.indexOf(value) !== -1) {
            // Circular reference found, discard key
            return;
        }
        // Store value in our collection
        replacerCache.push(value);
    }

    return value;
  };

  const bindings: string[] = [];
  for (const bdgnArr of (<any>container)._bindingDictionary._map.values()) {
    bdgnArr.map( (bdgn: any) => {
      let value = '';

      if (isFunction(bdgn.implementationType))
        value = bdgn.implementationType.name;
      else if (bdgn.type === 'ConstantValue') {
        if (isJsobject(bdgn.cache) && isFunction(bdgn.cache.constructor) && bdgn.constructor !== Object) {
          value = bdgn.constructor.name;
        }
        else
          value = JSON.stringify(bdgn.cache, replacer).substr(0, 100);
      }

      replacerCache = [];

      const identifier = typeof bdgn.serviceIdentifier === 'function' ? bdgn.serviceIdentifier.name : bdgn.serviceIdentifier;
      if (identifier !== '')
        bindings.push(`${identifier.toString()} => ${bdgn.scope} ${bdgn.type} ${value}`);
    });
  }

  return bindings;
}

import * as Debug from 'debug';
import { registerSingleton } from '../../di';
import { ENDPOINT_SYMBOL } from './symbols';
import { ServiceConfiguration } from './types';

const debug = Debug('annotations');

export const lambdaService = (config: ServiceConfiguration) => {
  debug('Creating class annotation');
  return (target: any) => {
    debug('Running class annotation');

    target.prototype[ENDPOINT_SYMBOL] = config;

    debug('conf injected', target.prototype[ENDPOINT_SYMBOL]);

    registerSingleton(target);
  };
};

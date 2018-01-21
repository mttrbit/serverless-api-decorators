import { registerSingleton } from '../../di';
import { ENDPOINT_SYMBOL } from './symbols';
import { ServiceConfiguration } from './types';

export const lambdaService = (config: ServiceConfiguration) => {
  return (target: any) => {
    target.prototype[ENDPOINT_SYMBOL] = config;
    registerSingleton(target);
  };
};

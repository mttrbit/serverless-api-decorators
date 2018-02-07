import { LambdaFunctionConfig } from './types';

export const createConfig = ({
  name = undefined,
  path = '/',
  method = undefined,
  integration = undefined,
  resolveWithFullResponse = false,
}): LambdaFunctionConfig => ({
  name,
  path,
  method,
  integration,
  resolveWithFullResponse,
});

export const createDecoratedConfig = ({ config, key }): LambdaFunctionConfig => ({
  integration: config.integration || 'lambda',
  method: config.method || 'get',
  path: config.path,
  // setting real function name
  functionName: key,
  resolveWithFullResponse: config.resolveWithFullResponse || false,
  name: config.name ? config.name : key,
});

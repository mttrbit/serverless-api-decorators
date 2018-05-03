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
  private: true,
});

export const createDecoratedConfig = ({ config, key }): LambdaFunctionConfig => ({
  integration: config.integration || 'lambda',
  method: config.method || 'get',
  path: config.path,
  cors: config.cors === undefined ? true : config.cors,
  private: config.private === undefined ? true : config.private,
  // setting real function name
  functionName: key,
  resolveWithFullResponse: config.resolveWithFullResponse || false,
  name: config.name ? config.name : key,
});

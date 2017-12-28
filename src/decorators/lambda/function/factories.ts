import { LambdaFunctionConfig } from './types';

export const createConfig = ({
  name = undefined,
  path = '/',
  method = undefined,
  integration = undefined,
}): LambdaFunctionConfig => ({ name, path, method, integration });

export const createDecoratedConfig = ({ config, key }): LambdaFunctionConfig => ({
  integration: config.integration || 'lambda',
  method: config.method || 'get',
  path: config.path,
  // setting real function name
  functionName: key,
  name: config.name ? config.name : key,
});

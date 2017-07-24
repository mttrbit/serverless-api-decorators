import { LambdaConfig } from '../types';

export class DefaultLambdaFunctionIntegrationResolver {
  public getFunctionIntegration(config: LambdaConfig) {
    return (config.integration) ? config.integration : 'lambda';
  }
}

import { LambdaConfig } from '../types';

export class DefaultLambdaFunctionNameResolver {
  public getFunctionName(functionName: string, config: LambdaConfig) {
    const fnName = config.name;
    return (fnName) ? fnName : functionName;
  }
}

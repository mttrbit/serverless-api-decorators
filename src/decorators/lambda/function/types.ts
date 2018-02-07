export interface LambdaFunctionConfig {
  resolveWithFullResponse?: boolean;
  integration: string;
  method: string;
  name?: string;
  path: string;
  [name: string]: string | boolean;
}

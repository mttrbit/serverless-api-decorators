export interface LambdaFunctionConfig {
  resolveWithFullResponse?: boolean;
  integration: string;
  method: string;
  name?: string;
  private?: boolean;
  path: string;
  [name: string]: string | boolean;
}

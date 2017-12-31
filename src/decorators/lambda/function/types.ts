export interface LambdaFunctionConfig {
  integration: string;
  method: string;
  name?: string;
  path: string;
  [name: string]: string;
}

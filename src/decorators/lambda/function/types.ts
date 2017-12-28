export type HttpMethod = 'get' | 'post' | 'update' | 'delete' | 'put';

export interface LambdaFunctionConfig {
  integration: string;
  method: string;
  name?: string;
  path: string;
  [name: string]: string;
}

export interface ServiceConfiguration {
  name: string;
  path: string;
  xOrigin?: boolean;
}

export interface LambdaConfig {
  name?: string;
  integration?: string;
  method: string | [string];
  path: string;
}

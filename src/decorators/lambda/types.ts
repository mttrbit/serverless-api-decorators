export interface ServiceConfiguration {
  name: string;
  path: string;
  xOrigin?: boolean;
}

export interface LambdaConfig {
  integration?: string;
  method: string | [string];
  name?: string;
  path: string;
}
